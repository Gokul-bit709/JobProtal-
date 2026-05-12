import razorpay
from django.conf import settings

client = razorpay.Client(auth=(settings.RAZORPAY_KEY, settings.RAZORPAY_SECRET))


def create_order(amount):
    return client.order.create({
        "amount": int(amount * 100),
        "currency": "INR",
        "payment_capture": 1
    })

 
from django.conf import settings
from django.contrib.gis.geoip2 import GeoIP2
import ipaddress
import logging
from jobapp.models import AdminAccessLog
 
# for security setting
def _is_public_ip(ip_text):
    """
    True when the IP looks publicly routable.
    """
    try:
        ip_obj = ipaddress.ip_address(ip_text)
    except ValueError:
        return False
 
    return not (
        ip_obj.is_private
        or ip_obj.is_loopback
        or ip_obj.is_link_local
        or ip_obj.is_multicast
        or ip_obj.is_reserved
        or ip_obj.is_unspecified
    )
 
 
def _extract_client_ip(request):
    """
    Pull client IP from proxy headers and prefer a public IP when present.
    """
    if request is None:
        return None
 
    header_order = [
        "HTTP_CF_CONNECTING_IP",          # Cloudflare
        "HTTP_X_FORWARDED_FOR",           # Standard proxy chain
        "HTTP_X_REAL_IP",                 # Nginx/common proxy
        "HTTP_X_CLIENT_IP",               # Some proxies
        "HTTP_X_ORIGINAL_FORWARDED_FOR",  # Some edge platforms
        "REMOTE_ADDR",                    # Direct socket peer
    ]
 
    parsed_ips = []
 
    for header_name in header_order:
        raw_value = request.META.get(header_name, "")
        if not raw_value:
            continue
 
        # Most proxy headers can contain a comma-separated chain.
        for token in str(raw_value).split(","):
            normalized = _normalize_ip(token)
            if normalized:
                parsed_ips.append(normalized)
 
    if not parsed_ips:
        return None
 
    # Prefer first public IP from header chain; fallback to first valid.
    for parsed_ip in parsed_ips:
        if _is_public_ip(parsed_ip):
            return parsed_ip
 
    return parsed_ips[0]
 
 
def _normalize_ip(raw_ip):
    if not raw_ip:
        return None
 
    candidate = raw_ip.strip()
 
    # [IPv6]:port -> IPv6
    if candidate.startswith("[") and "]" in candidate:
        candidate = candidate[1:candidate.index("]")]
 
    # IPv4:port -> IPv4
    if candidate.count(":") == 1 and "." in candidate:
        host, port = candidate.rsplit(":", 1)
        if port.isdigit():
            candidate = host
 
    # IPv4-mapped IPv6 (::ffff:1.2.3.4) -> 1.2.3.4
    if candidate.lower().startswith("::ffff:"):
        candidate = candidate.split(":", 3)[-1]
 
    try:
        return str(ipaddress.ip_address(candidate))
    except ValueError:
        return None
 
 
def _resolve_location(ip_address):
    if not ip_address:
        return ""
 
    try:
        ip_obj = ipaddress.ip_address(ip_address)
    except ValueError:
        return ""
 
    # Local/private ranges cannot be geolocated by MaxMind city DB.
    if ip_obj.is_loopback:
        return "Localhost"
 
    if ip_obj.is_private or ip_obj.is_reserved or ip_obj.is_link_local or ip_obj.is_unspecified:
        return "Private Network"
 
    try:
        geo = GeoIP2(path=str(settings.GEOIP_PATH))
    except Exception as exc:
        logger.warning("GeoIP init failed: %s", exc)
        return ""
 
    try:
        city_data = geo.city(ip_address)
        country = city_data.get("country_name", "") or ""
        region = city_data.get("region", "") or ""
        city = city_data.get("city", "") or ""
 
        parts = [part for part in [city, region, country] if part]
        if parts:
            return ", ".join(parts)
    except Exception as exc:
        logger.info("GeoIP city lookup failed for %s: %s", ip_address, exc)
 
    try:
        country_data = geo.country(ip_address)
        return country_data.get("country_name", "") or ""
    except Exception as exc:
        logger.info("GeoIP country lookup failed for %s: %s", ip_address, exc)
        return ""
class AdminSecurityService:
 
    @staticmethod
    def log_event(
        request,
        action,
        status="SUCCESS",
        user=None,
        extra_data=None,
    ):
 
        ip_address = _extract_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "") if request else ""
        location = _resolve_location(ip_address)
       
        # CREATE ACCESS LOG
     
 
        AdminAccessLog.objects.create(
            user=user,
            action=action,
            status=status,
            ip_address=ip_address,
            location=location,
            user_agent=user_agent,
            extra_data=extra_data or {},
        )
 
 
from datetime import timedelta
 
from django.utils import timezone
 
from jobapp.models import (
    AdminProfile,
    EmailOTP,
    SMSOTP,
)
 
from jobapp.utils import (
    generate_otp,
    send_email_otp,
)
 
 
class Admin2FAService:
 
    @staticmethod
    def handle_admin_login_2fa(user):
 
     
        # ONLY ADMIN
       
 
        if user.user_type != "admin":
 
            return None
 
        profile, _ = AdminProfile.objects.get_or_create(
            user=user
        )
 
       
        # 2FA NOT ENABLED
     
 
        if not profile.two_factor_enabled:
 
            return None
 
        method = profile.two_factor_method
 
        otp = generate_otp()
 
       
 
        if method == "email":
 
            # expire old OTPs
 
            EmailOTP.objects.filter(
                email=user.email,
                purpose="admin_login_2fa",
                is_verified=False
            ).update(
                expires_at=timezone.now() - timedelta(minutes=1)
            )
 
            # create new OTP
 
            EmailOTP.objects.create(
                email=user.email,
                otp=otp,
                purpose="admin_login_2fa",
                expires_at=timezone.now() + timedelta(minutes=5)
            )
 
            # send email OTP
 
            send_email_otp(
                user.email,
                otp,
                "admin_login_2fa"
            )
 
       
 
        elif method == "sms":
 
            if not user.phone:
 
                return {
                    "success": False,
                    "message": "Phone number not available"
                }
 
            SMSOTP.objects.filter(
                phone=user.phone,
                purpose="admin_login_2fa",
                is_verified=False
            ).update(
                expires_at=timezone.now() - timedelta(minutes=1)
            )
 
            SMSOTP.objects.create(
                phone=user.phone,
                otp=otp,
                purpose="admin_login_2fa",
                expires_at=timezone.now() + timedelta(minutes=5)
            )
 
            print(f"[LOGIN OTP SMS] {user.phone}: {otp}")
 
       
 
        return {
 
            "requires_2fa": True,
 
            "method": method,
 
            "user_id": user.id,
 
            "message": f"OTP sent via {method}"
        }
 