import secrets
from django.core.mail import send_mail
from django.conf import settings
 
def generate_token():
    """Generate a secure token"""
    return secrets.token_urlsafe(32)
 
def send_password_reset_email(user, token, request):
    """Send password reset email"""
    reset_link = f"{request.scheme}://{request.get_host()}/reset-password?token={token}"
   
    subject = 'Password Reset Request'
    message = f"""
    Hello {user.username},
   
    We received a request to reset your password.
   
    Click the link below to reset your password:
    {reset_link}
   
    This link will expire in 24 hours.
   
    If you didn't request this, please ignore this email.
    """
   
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )