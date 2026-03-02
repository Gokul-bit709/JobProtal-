import secrets
from django.core.mail import send_mail
from django.conf import settings
 
def generate_token():
    """Generate a secure token"""
    return secrets.token_urlsafe(32)
 
def send_password_reset_email(user, token, request):
    """Send password reset email with token separate from URL"""
   
    frontend_url = settings.FRONTEND_URL
    reset_page = f"{frontend_url}/Job-portal/jobseeker/login/forgotpassword/createpassword"
   
    subject = 'Password Reset Request'
    message = f"""
Hello {user.username},
 
We received a request to reset your password for {user.email}.
 
Please visit this link:
{reset_page}
 
And enter this token on the page:
{token}
 
This token will expire in 24 hours.
 
If you didn't request this, please ignore this email.
"""
   
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
 