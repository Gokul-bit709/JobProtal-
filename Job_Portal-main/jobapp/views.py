from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.db.models import Q, Count
from datetime import timedelta

from .serializers import (
    JobSeekerRegistrationSerializer,
    EmployerRegistrationSerializer,
    JobSeekerProfileReadSerializer,
    JobSeekerProfileWriteSerializer,
    EmployerProfileReadSerializer,
    EmployerProfileWriteSerializer,
    UserReadSerializer,
    JobApplicationDetailSerializer,
    NotificationSerializer,
    CustomTokenObtainPairSerializer,
    ContactMessageSerializer,
    # REMOVED: CompanySerializer
    PostAJobSerializer,
    JobReadSerializer,
    JobWriteSerializer,
    JobUpdateSerializer,
    JobApplicationWriteSerializer,
    JobApplicationEmployerSerializer,
    JobApplicationListSerializer,
    SavedJobSerializer,
    UserSettingsSerializer,
    ConversationSerializer,
    MessageSerializer,
    SendMessageSerializer,
    ChatUserSerializer,
    ChatMessageSerializer,
    HelpTopicSerializer,
    RaiseTicketSerializer,
    ForgotPasswordSerializer,
    ResetPasswordConfirmSerializer,
    CreatePasswordSerializer,
    NewsletterSubscriberSerializer,
    CompanyVerificationSerializer,
    CompanyProfileSerializer,
    ComplaintSerializer,
    VerifyEmailOTPSerializer,
    PlanSerializer,
    SubscriptionSerializer,
    InvoiceSerializer,
    PaymentMethodSerializer,
    AdminCompanySerializer,

)

from .models import (
    User, JobSeekerProfile, EmployerProfile, PostAJob, 
    JobApplication, SavedJob, Notification, UserSettings,
    Conversation, Message, ChatMessage, HelpTopic, RaiseTicket,
    PasswordResetToken, EmailOTP, NewsletterSubscriber,
    CompanyVerification, CompanyProfile, Complaint, Plan, Subscription,
    Invoice, PaymentMethod,CompanyEmailOTP,
)
from .permissions import IsAdminOrEmployer, IsEmployerOrAdmin, IsJobSeeker, IsAdminUserType
from .utils import generate_otp, generate_4digit_otp, send_email_otp, generate_token, send_password_reset_email,generate_company_otp, send_company_email_otp

User = get_user_model()


# ============ REGISTRATION VIEWS ============

class JobSeekerRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        email_verified = EmailOTP.objects.filter(
            email=email,
            purpose="email_verification",
            is_verified=True
        ).exists()

        if not email_verified:
            return Response({"error": "Please verify your email first"}, status=400)

        serializer = JobSeekerRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            user.is_active = True
            user.save()

            return Response({
                "message": "User registered successfully"
            }, status=201)
        else:
            return Response(serializer.errors, status=400)
 

class EmployerRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print(f"Registration data received: {request.data}")
        
        email = request.data.get("email")
        
        email_verified = EmailOTP.objects.filter(
            email=email,
            purpose="email_verification",
            is_verified=True
        ).exists()
        
        if not email_verified:
            return Response(
                {"error": "Please verify your email first"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = EmployerRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            user.is_active = True
            user.save()

            print(f"User created: {user.email}, Type: {user.user_type}")

            return Response({
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "user_type": user.user_type,
                    "phone": user.phone
                }
            }, status=status.HTTP_201_CREATED)

        print(f"Registration errors: {serializer.errors}")

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============ AUTHENTICATION VIEWS ============

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer
 

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                raise ValidationError("Refresh token is required.")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
 

# ============ PROFILE VIEWS ============

class JobSeekerProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobSeekerProfileReadSerializer
        return JobSeekerProfileWriteSerializer

    def get_object(self):
        profile, created = JobSeekerProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile

    def update(self, request, *args, **kwargs):
        print("\n" + "="*80)
        print("🚀 JOBSEEKER PROFILE UPDATE - START")
        print("="*80)

        print(f"📌 User: {request.user.email} (ID: {request.user.id})")
        print(f"📌 Method: {request.method}")
        print(f"📌 Content-Type: {request.headers.get('Content-Type', 'Not specified')}")

        content_type = request.headers.get('Content-Type', '')

        if 'multipart/form-data' in content_type and 'data' in request.data:
            try:
                import json
                json_data = json.loads(request.data.get('data'))
                print("\n📦 Parsed JSON data from 'data' field:")
                print(json.dumps(json_data, indent=2, default=str)[:1000])

                combined_data = {}

                # Add all JSON data
                for key, value in json_data.items():
                    combined_data[key] = value

                # ✅ IMPORTANT: Check for delete_profile_photo flag in FormData
                if 'delete_profile_photo' in request.data:
                    combined_data['delete_profile_photo'] = request.data.get('delete_profile_photo') == 'true'
                    print(f"📸 Found delete_profile_photo flag: {combined_data['delete_profile_photo']}")

                # Add file data
                for key, value in request.data.items():
                    if key != 'data':
                        combined_data[key] = value
                
                # Process certifications
                certifications_list = []
                
                # First, get certifications from JSON data
                if 'certifications' in json_data:
                    certifications_list = json_data['certifications']
                
                # Then, check for files in FormData and merge with existing IDs
                cert_index = 0
                while f'certifications[{cert_index}][name]' in request.data:
                    cert_name = request.data.get(f'certifications[{cert_index}][name]')
                    cert_id = request.data.get(f'certifications[{cert_index}][id]')
                    cert_file = request.FILES.get(f'certifications[{cert_index}][certificate_file]')
                    
                    if cert_index < len(certifications_list):
                        if cert_id:
                            certifications_list[cert_index]['id'] = int(cert_id)
                        certifications_list[cert_index]['name'] = cert_name
                        if cert_file:
                            certifications_list[cert_index]['certificate_file'] = cert_file
                    else:
                        cert_dict = {'name': cert_name}
                        if cert_id:
                            cert_dict['id'] = int(cert_id)
                        if cert_file:
                            cert_dict['certificate_file'] = cert_file
                        certifications_list.append(cert_dict)
                    
                    cert_index += 1
                
                if certifications_list:
                    print("FINAL certifications_list:", certifications_list)
                    combined_data['certifications'] = certifications_list
                    print(f"\n📦 Processed {len(certifications_list)} certifications")
                    for i, cert in enumerate(certifications_list):
                        print(f"   Cert {i}: ID={cert.get('id')}, Name={cert.get('name')}, HasFile={bool(cert.get('certificate_file'))}")

                # Replace request.data with our combined data
                request._full_data = combined_data

            except Exception as e:
                print(f"Error parsing JSON data: {e}")
                import traceback
                traceback.print_exc()

        print("\n" + "="*80)
        print("🚀 CALLING SUPER().UPDATE()")
        print("="*80 + "\n")

        return super().update(request, *args, **kwargs)

class JobSeekerListView(generics.ListAPIView):
    queryset = JobSeekerProfile.objects.all()
    serializer_class = JobSeekerProfileReadSerializer
    permission_classes = [IsAdminOrEmployer]
   

class EmployerProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
 
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EmployerProfileReadSerializer
        return EmployerProfileWriteSerializer
 
    def get_object(self):
        if not hasattr(self.request.user, 'employer_profile'):
            raise ValidationError("You are not an employer.")
        return self.request.user.employer_profile
   

# ============ COMPANY VIEWS - REMOVED AND REPLACED WITH COMPANYPROFILE ============

# REMOVED: CompanyListView, CompanyDetailView, CompanyCreateView, 
# CompanyLinkView, CompanyEditView, AdminCompanyToggleActiveView

# These have been replaced with CompanyProfile views at the bottom of the file


# ============ JOB VIEWS ============

class JobListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return PostAJob.objects.filter(is_published=True)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        search = request.query_params.get("search")
        location = request.query_params.get("location")
        experience = request.query_params.get("experience")
        company_id = request.query_params.get("company")
        
        if company_id:
            # Changed to use CompanyProfile
            queryset = queryset.filter(employer__employer_profile__company_id=company_id)
        
        if search:
            queryset = queryset.filter(job_title__icontains=search)
        
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        if experience:
            queryset = queryset.filter(experience__icontains=experience)
        
        # Order by newest first
        queryset = queryset.order_by('-created_at')
        
        serializer = PostAJobSerializer(queryset, many=True)
        return Response(serializer.data)
 

class JobDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = PostAJobSerializer
    queryset = PostAJob.objects.filter(is_published=True)
 

class JobCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostAJobSerializer
 
    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'employer_profile'):
            raise PermissionDenied("Only employers can post jobs.")
        employer_profile = self.request.user.employer_profile
        if not employer_profile.company:
            raise PermissionDenied("You must link a company before posting jobs.")
        serializer.save(employer=self.request.user, is_published=False)
 

class JobUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostAJobSerializer
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 

class JobDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostAJobSerializer
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 

class JobToggleActiveView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostAJobSerializer
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 
    def perform_update(self, serializer):
        job = serializer.instance
        job.is_published = not job.is_published
        job.save()
        serializer.save()
 

# ============ POST A JOB VIEWS ============

class CreateJobPreviewView(generics.CreateAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def create(self, request, *args, **kwargs):
        print("=" * 50)
        print("Received job data:", request.data)
        print("=" * 50)
        return super().create(request, *args, **kwargs)
 
    def perform_create(self, serializer):
        user = self.request.user
 
        if user.user_type != "employer":
            raise PermissionDenied("Only employers can post jobs")
 
        if not hasattr(user, "employer_profile"):
            raise PermissionDenied("Employer profile not found")
 
        employer_profile = user.employer_profile
 
        if not employer_profile.company:
            raise PermissionDenied("You must link a company first")
 
        verification = CompanyVerification.objects.filter(
            employer=user,
            status="approved"
        ).exists()
 
        if not verification:
            raise PermissionDenied("Company must be verified before posting jobs")
 
        serializer.save(
            employer=user,
            is_published=False
        )
   
    def handle_exception(self, exc):
        print(f"Exception occurred: {exc}")
        return super().handle_exception(exc)
 

class PreviewJobView(generics.RetrieveAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 

class PublishJobView(APIView):
    permission_classes = [IsAuthenticated]
 
    def patch(self, request, pk):
        if request.user.user_type != "employer":
            raise PermissionDenied("Only employers can publish jobs")
 
        job = get_object_or_404(
            PostAJob,
            id=pk,
            employer=request.user
        )
 
        job.is_published = True
        job.save()
 
        return Response({
            "message": "Job posted successfully",
            "job_id": job.id,
            "job_title": job.job_title
        }, status=status.HTTP_200_OK)
 

class UpdateJobView(generics.UpdateAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
   
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['partial'] = True
        return context
   
    def patch(self, request, *args, **kwargs):
        print("=" * 50)
        print("PATCH request received for job update")
        print("Request data:", request.data)
        print("=" * 50)
        return super().patch(request, *args, **kwargs)
 

class DeleteJobView(generics.DestroyAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 

class PostedJobListView(generics.ListAPIView):
    queryset = PostAJob.objects.filter(is_published=True)
    serializer_class = PostAJobSerializer
 

class EmployerJobListView(generics.ListAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)


class JobSeekerJobListView(generics.ListAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
   
    def get_queryset(self):
        return PostAJob.objects.filter(
            is_published=True
        ).order_by('-created_at')
   
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
       
        return Response({
            'total_jobs': queryset.count(),
            'jobs': serializer.data
        })


class JobSeekerJobDetailView(generics.RetrieveAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
   
    def get_queryset(self):
        return PostAJob.objects.filter(is_published=True)


# ============ JOB APPLICATION & SAVED JOBS ============

class ApplyJobView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationWriteSerializer
    parser_classes = [MultiPartParser, FormParser]
 
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
 
        if not serializer.is_valid():
            print("❌ JOB APPLY VALIDATION ERROR:", serializer.errors)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
 
        instance = serializer.save()
 
        job = instance.job
        if job.employer and hasattr(job.employer, 'employer_profile'):
            Notification.objects.create(
                user=job.employer,
                message=f"New application received for '{job.job_title}' from {request.user.email}"
            )
 
        detail_serializer = JobApplicationDetailSerializer(instance)
        headers = self.get_success_headers(serializer.data)
       
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
 

class AppliedJobsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationListSerializer
 
    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)
 

class SaveJobView(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        serializer = SavedJobSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
 
        try:
            serializer.save(user=request.user)
        except IntegrityError:
            raise ValidationError({"detail": "Job already saved"})
 
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )
 
    def delete(self, request, job_id):
        deleted, _ = SavedJob.objects.filter(
            user=request.user,
            job_id=job_id
        ).delete()
 
        if deleted == 0:
            return Response(
                {"detail": "Saved job not found"},
                status=status.HTTP_404_NOT_FOUND
            )
 
        return Response(status=status.HTTP_204_NO_CONTENT)
 

class SavedJobsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedJobSerializer
 
    def get_queryset(self):
        return (
            SavedJob.objects
            .filter(user=self.request.user)
            .select_related("job")
            .order_by("-saved_date")
        )
 

class WithdrawApplicationView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationDetailSerializer
    queryset = JobApplication.objects.all()
 
    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)
 
    def perform_update(self, serializer):
        application = serializer.instance
        if application.status == JobApplication.Status.WITHDRAWN:
            raise ValidationError("Application is already withdrawn.")
       
        application.status = JobApplication.Status.WITHDRAWN
        application.save()
       
        return Response(JobApplicationDetailSerializer(application).data)
 

class JobApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = JobApplicationListSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)
 

# ============ EMPLOYER APPLICATION VIEWS ============

class EmployerApplicationsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationEmployerSerializer
 
    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'employer_profile'):
            return JobApplication.objects.none()
        jobs = PostAJob.objects.filter(employer=user, is_published=True)
        return JobApplication.objects.filter(job__in=jobs)
   

class EmployerApplicationStatusUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationEmployerSerializer
 
    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'employer_profile'):
            return JobApplication.objects.none()
       
        jobs = PostAJob.objects.filter(employer=user)
        return JobApplication.objects.filter(job__in=jobs)
 
    def perform_update(self, serializer):
        application = serializer.instance
        new_status = self.request.data.get('status')
       
        if not new_status:
            raise ValidationError({"status": "This field is required to update status."})
       
        if new_status not in [choice[0] for choice in JobApplication.Status.choices]:
            raise ValidationError({"status": f"Invalid status."})
       
        application.status = new_status
        application.save()
 
        Notification.objects.create(
            user=application.user,
            message=f"Your application for '{application.job.job_title}' has been updated to: {new_status.replace('_', ' ').title()}"
        )
 
        return Response(JobApplicationEmployerSerializer(application).data)
 

# ============ NOTIFICATION VIEWS ============

class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
 
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
 

class MarkNotificationReadView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
 
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
 
    def perform_update(self, serializer):
        serializer.instance.is_read = True
        serializer.instance.save()
       

class MarkNotificationUnreadView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
 
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
 
    def perform_update(self, serializer):
        serializer.instance.is_read = False
        serializer.instance.save()
 

class DeleteNotificationView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Notification.objects.all()
 
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
 

class ClearAllNotificationsView(APIView):
    permission_classes = [IsAuthenticated]
 
    def delete(self, request):
        Notification.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
 

# ============ USER SETTINGS ============

class UserSettingsView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)
 
    def patch(self, request):
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(
            settings, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
 

# ============ CHAT VIEWS ============

class ConversationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer
   
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)
   
    def get_serializer_context(self):
        return {'request': self.request}
 

class ConversationDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer
   
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)
   
    def get_serializer_context(self):
        return {'request': self.request}
 

class ConversationMessagesView(APIView):
    permission_classes = [IsAuthenticated]
   
    def get(self, request, pk):
        conversation = get_object_or_404(Conversation, pk=pk)
       
        if request.user not in conversation.participants.all():
            return Response(
                {'error': 'You are not a participant in this conversation'},
                status=status.HTTP_403_FORBIDDEN
            )
       
        messages = conversation.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
 

class MarkConversationReadView(APIView):
    permission_classes = [IsAuthenticated]
   
    def post(self, request, pk):
        conversation = get_object_or_404(Conversation, pk=pk)
       
        if request.user not in conversation.participants.all():
            return Response(
                {'error': 'You are not a participant in this conversation'},
                status=status.HTTP_403_FORBIDDEN
            )
       
        conversation.messages.filter(
            receiver=request.user,
            is_read=False
        ).update(is_read=True)
       
        return Response({'status': 'conversation marked as read'})
 

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]
   
    def post(self, request):
        serializer = SendMessageSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            message = serializer.save()
            return Response(
                MessageSerializer(message).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]
   
    def get(self, request):
        count = Message.objects.filter(
            receiver=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})
 

class ConversationWithUserView(APIView):
    permission_classes = [IsAuthenticated]
   
    def get(self, request):
        other_user_id = request.query_params.get('user_id')
        if not other_user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
       
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
       
        conversation = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=other_user
        ).first()
       
        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, other_user)
       
        messages = conversation.messages.all()[:50]
        return Response({
            'conversation_id': conversation.id,
            'participants': ChatUserSerializer([request.user, other_user], many=True).data,
            'messages': MessageSerializer(messages, many=True).data
        })
 

class MarkMessageReadView(APIView):
    permission_classes = [IsAuthenticated]
   
    def post(self, request, pk):
        message = get_object_or_404(Message, pk=pk)
       
        if message.receiver != request.user:
            return Response(
                {'error': 'You can only mark messages sent to you as read'},
                status=status.HTTP_403_FORBIDDEN
            )
       
        message.is_read = True
        message.save()
        return Response({'status': 'message marked as read'})
 

class ChatUsersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatUserSerializer
   
    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id)
   

class EmployerInitiateChatView(APIView):
    permission_classes = [IsAuthenticated]
   
    def post(self, request):
        if request.user.user_type != 'employer':
            return Response(
                {'error': 'Only employers can initiate new conversations'},
                status=status.HTTP_403_FORBIDDEN
            )
       
        jobseeker_id = request.data.get('jobseeker_id')
        initial_message = request.data.get('message', '')
       
        if not jobseeker_id:
            return Response(
                {'error': 'jobseeker_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
       
        try:
            jobseeker = User.objects.get(id=jobseeker_id, user_type='jobseeker')
        except User.DoesNotExist:
            return Response(
                {'error': 'Jobseeker not found'},
                status=status.HTTP_404_NOT_FOUND
            )
       
        conversation = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=jobseeker
        ).first()
       
        if not conversation:
            conversation = Conversation.objects.create(
                initiated_by=request.user
            )
            conversation.participants.add(request.user, jobseeker)
           
            if initial_message:
                message = Message.objects.create(
                    conversation=conversation,
                    sender=request.user,
                    receiver=jobseeker,
                    content=initial_message
                )
                return Response({
                    'status': 'Conversation started',
                    'conversation_id': conversation.id,
                    'message': MessageSerializer(message).data
                }, status=status.HTTP_201_CREATED)
       
        return Response({
            'status': 'Conversation exists',
            'conversation_id': conversation.id
        })    
   

@api_view(["POST"])
def chat_api(request):
    user_message = request.data.get("message")
 
    if not user_message:
        return Response({"error": "Message is required"}, status=400)
 
    user_msg = ChatMessage.objects.create(
        sender="user",
        message=user_message
    )
 
    bot_reply_text = generate_bot_reply(user_message)
 
    bot_msg = ChatMessage.objects.create(
        sender="bot",
        message=bot_reply_text
    )
 
    return Response({
        "user": ChatMessageSerializer(user_msg).data,
        "bot": ChatMessageSerializer(bot_msg).data
    })


def generate_bot_reply(user_text):
    text = user_text.lower()
 
    login_responses = [
        "You can log in as a jobseeker by clicking Login → Jobseeker and entering your registered email and password.",
        "To access your account, go to the Login page and choose the Jobseeker option.",
        "Simply click on Login, select your role, and enter your credentials to continue.",
        "Use your registered email and password in the Login section to access your dashboard."
    ]
 
    job_responses = [
        "You can browse available jobs from the Jobs section on your dashboard.",
        "Head over to the Jobs tab to explore current openings.",
        "All listed opportunities are available under the Jobs section.",
        "Visit the dashboard and click on Jobs to see matching positions."
    ]
 
    register_responses = [
        "Click on Register and fill in your details to create an account.",
        "To get started, select Register and complete the signup form.",
        "Choose Register, provide your information, and submit the form.",
        "You can create a new account by clicking the Register button."
    ]
 
    default_responses = [
        "Could you please provide more details so I can assist you better?",
        "I'm here to help. Can you clarify your question?",
        "Let me know a bit more information so I can guide you properly.",
        "Can you explain your concern in more detail?"
    ]
 
    if "login" in text:
        return random.choice(login_responses)
    elif "job" in text:
        return random.choice(job_responses)
    elif "register" in text:
        return random.choice(register_responses)
 
    return random.choice(default_responses)


# ============ HELP & TICKET VIEWS ============

@api_view(['GET'])
def help_topics(request):
    topics = HelpTopic.objects.all().order_by('-id')
    serializer = HelpTopicSerializer(topics, many=True)
    return Response({
        "status": True,
        "message": "Help topics fetched successfully",
        "data": serializer.data
    })
 

class RaiseTicketCreateView(APIView):
    def get(self, request):
        return Response({
            "status": True,
            "message": "Raise Ticket API Working"
        })
 
    def post(self, request):
        serializer = RaiseTicketSerializer(data=request.data)
 
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": True,
                "message": "Ticket submitted successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
 
        return Response({
            "status": False,
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
 

# ============ PASSWORD MANAGEMENT ============

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data, context={'request': request})
       
        if serializer.is_valid():
            user = serializer.context['user']
           
            PasswordResetToken.objects.filter(user=user, is_used=False).delete()
                     
            token = generate_token()
            reset_token = PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(hours=24)
            )
           
            try:
                send_password_reset_email(user, token, request)
                return Response({
                    "message": "Password reset instructions have been sent to your email."
                }, status=status.HTTP_200_OK)
            except Exception as e:
                reset_token.delete()
                return Response({
                    "error": "Failed to send email. Please try again."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
       
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

class ResetPasswordConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)

        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            try:
                reset_token = PasswordResetToken.objects.get(
                    token=token,
                    is_used=False
                )

                if not reset_token.is_valid():
                    return Response({
                        "error": "Token has expired."
                    }, status=400)

                user = reset_token.user

                user.set_password(new_password)
                user.is_active = True

                if hasattr(user, "is_verified"):
                    user.is_verified = True

                user.save()

                reset_token.is_used = True
                reset_token.save()

                refresh = RefreshToken.for_user(user)

                return Response({
                    "message": "Password has been reset successfully.",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh)
                }, status=200)

            except PasswordResetToken.DoesNotExist:
                return Response({
                    "error": "Invalid or expired token."
                }, status=400)

        return Response(serializer.errors, status=400)
 

class CreatePasswordView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        serializer = CreatePasswordSerializer(data=request.data)
       
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
           
            try:
                reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
               
                if not reset_token.is_valid():
                    return Response({
                        "error": "Token has expired."
                    }, status=status.HTTP_400_BAD_REQUEST)
               
                user = reset_token.user
               
                if user.password and not user.password.startswith('!'):
                    return Response({
                        "error": "Password already set. Please use forgot password if you need to reset it."
                    }, status=status.HTTP_400_BAD_REQUEST)
               
                user.set_password(new_password)
                user.save()
               
                reset_token.is_used = True
                reset_token.save()
               
                refresh = RefreshToken.for_user(user)
               
                return Response({
                    "message": "Password created successfully.",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh)
                }, status=status.HTTP_200_OK)
               
            except PasswordResetToken.DoesNotExist:
                return Response({
                    "error": "Invalid or expired token."
                }, status=status.HTTP_400_BAD_REQUEST)
       
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

class ValidateResetTokenView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        token = request.data.get('token')
       
        if not token:
            return Response({
                "valid": False,
                "error": "Token is required."
            }, status=status.HTTP_400_BAD_REQUEST)
       
        try:
            reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
           
            if reset_token.is_valid():
                return Response({
                    "valid": True,
                    "message": "Token is valid."
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "valid": False,
                    "message": "Token has expired."
                }, status=status.HTTP_200_OK)
               
        except PasswordResetToken.DoesNotExist:
            return Response({
                "valid": False,
                "message": "Invalid token."
            }, status=status.HTTP_200_OK)
 

class AdminCreatePasswordTokenView(APIView):
    permission_classes = [IsAdminUser]
 
    def post(self, request):
        user_id = request.data.get('user_id')
       
        if not user_id:
            return Response({
                "error": "user_id is required."
            }, status=status.HTTP_400_BAD_REQUEST)
       
        try:
            user = User.objects.get(id=user_id)
           
            PasswordResetToken.objects.filter(user=user, is_used=False).delete()
           
            token = generate_token()
            reset_token = PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(days=7)  
            )
           
            setup_link = f"{request.scheme}://{request.get_host()}/create-password?token={token}"
           
            return Response({
                "message": "Password creation token generated successfully.",
                "token": token,
                "setup_link": setup_link
            }, status=status.HTTP_200_OK)
           
        except User.DoesNotExist:
            return Response({
                "error": "User not found."
            }, status=status.HTTP_404_NOT_FOUND)    
       

# ============ CONTACT US ============

class ContactMessageCreateAPIView(APIView):
    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Message sent successfully"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
               

# ============ NEWSLETTER ============

class NewsletterSubscribeAPIView(APIView):
    def post(self, request):
        email = request.data.get("email")
        print(request.data)
 
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        if NewsletterSubscriber.objects.filter(email=email).exists():
            return Response(
                {"message": "Email already subscribed"},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        serializer = NewsletterSubscriberSerializer(data={"email": email})
 
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Subscribed successfully"},
                status=status.HTTP_201_CREATED
            )
 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============ COMPANY VERIFICATION ============

class SubmitCompanyVerification(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        if request.user.user_type != "employer":
            return Response(
                {"error": "Only employers can submit company verification"},
                status=status.HTTP_403_FORBIDDEN
            )
 
        if CompanyVerification.objects.filter(employer=request.user).exists():
            return Response({
                "error": "You already submitted verification"
            })
 
        # ✅ Pass the request context to serializer
        serializer = CompanyVerificationSerializer(
            data=request.data,
            context={'request': request}
        )
 
        if serializer.is_valid():
            serializer.save(employer=request.user)
 
            return Response({
                "message": "Verification submitted successfully",
                "status": "pending"
            })
 
        return Response(serializer.errors)
   

class CompanyVerificationAction(APIView):
    permission_classes = [IsAdminUser]
 
    def patch(self, request, pk):
        try:
            verification = CompanyVerification.objects.get(id=pk)
        except CompanyVerification.DoesNotExist:
            return Response({"error": "Verification not found"}, status=404)
 
        status_value = request.data.get("status")
 
        if status_value not in ["approved", "rejected"]:
            return Response({"error": "Invalid status"})
 
        verification.status = status_value
        verification.save()
 
        return Response({
            "message": f"Company {status_value} successfully"
        })

# ============ COMPANY PROFILE VIEWS ============
 
class CompanyProfileCreateView(APIView):
    permission_classes = [IsEmployerOrAdmin]

    def post(self, request):
        # Check if employer already has a company
        if hasattr(request.user, 'employer_profile') and request.user.employer_profile.company:
            return Response(
                {"error": "You are already linked to a company"}, 
                status=400
            )

        # Check for duplicate company name
        company_name = request.data.get('company_name')
        existing_company = CompanyProfile.objects.filter(company_name__iexact=company_name).first()

        if existing_company:
            # ✅ Return 400 error to trigger popup in frontend
            return Response(
                {"error": f"A company with the name '{company_name}' already exists. Please use a different name."}, 
                status=400
            )

        # Create new company
        serializer = CompanyProfileSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            company = serializer.save()

            if hasattr(request.user, 'employer_profile'):
                request.user.employer_profile.company = company
                request.user.employer_profile.save()

            return Response({
                "message": "Company profile created successfully",
                "company_id": company.id,
                "company_name": company.company_name,
                "is_existing": False
            }, status=201)

        return Response(serializer.errors, status=400)
 
class CompanyProfileDetailView(APIView):

    permission_classes = [IsEmployerOrAdmin]
 
    def get(self, request):

        # ✅ Get company through employer profile instead of user field

        if not hasattr(request.user, 'employer_profile'):

            return Response({"error": "Employer profile not found"}, status=404)

        company = request.user.employer_profile.company

        if not company:

            return Response({"error": "No company linked to this employer"}, status=404)
 
        serializer = CompanyProfileSerializer(

            company,

            context={'request': request}

        )
 
        return Response(serializer.data)

 
class CompanyProfileUpdateView(APIView):

    permission_classes = [IsEmployerOrAdmin]

    def patch(self, request):

        # ✅ Get company through employer profile

        if not hasattr(request.user, 'employer_profile'):

            return Response({"error": "Employer profile not found"}, status=404)

        company = request.user.employer_profile.company

        if not company:

            return Response({"error": "No company linked to this employer"}, status=404)

        serializer = CompanyProfileSerializer(

            company,

            data=request.data,

            partial=True,

            context={'request': request}

        )
 
        if serializer.is_valid():

            serializer.save()

            return Response({

                "message": "Profile updated successfully",

                "data": serializer.data

            }, status=200)

        return Response(serializer.errors, status=400)

 
class CompanyProfileListView(APIView):

    permission_classes = [IsAuthenticated]
 
    def get(self, request):

        companies = CompanyProfile.objects.all().order_by('-created_at')

        # ✅ If employer, only show their company (optional security)

        if request.user.user_type == 'employer' and hasattr(request.user, 'employer_profile'):

            if request.user.employer_profile.company:

                companies = companies.filter(id=request.user.employer_profile.company.id)
 
        serializer = CompanyProfileSerializer(

            companies,

            many=True,

            context={'request': request}

        )
 
        return Response(serializer.data, status=200)
 
 
class CompanyProfileByIdView(APIView):

    permission_classes = [IsAuthenticated]
 
    def get(self, request, company_id):

        try:

            company = CompanyProfile.objects.get(id=company_id)

            # ✅ Security check for employers - they can only view their own company

            if request.user.user_type == 'employer':

                if hasattr(request.user, 'employer_profile'):

                    if request.user.employer_profile.company_id != company_id:

                        return Response(

                            {"error": "You don't have permission to view this company"}, 

                            status=403

                        )
 
            serializer = CompanyProfileSerializer(

                company,

                context={'request': request}

            )
 
            return Response(serializer.data, status=200)
 
        except CompanyProfile.DoesNotExist:

            return Response(

                {"error": "Company not found"},

                status=404

            )
        
class LinkToExistingCompanyView(APIView):
    permission_classes = [IsEmployerOrAdmin]
    
    def post(self, request):
        company_name = request.data.get('company_name')
        
        if not company_name:
            return Response({"error": "Company name is required"}, status=400)
        
        # Find existing company (case-insensitive)
        company = CompanyProfile.objects.filter(company_name__iexact=company_name).first()
        
        if not company:
            return Response({"error": "Company not found. Please create a new company."}, status=404)
        
        # Check if employer already has a company
        if hasattr(request.user, 'employer_profile') and request.user.employer_profile.company:
            return Response({
                "error": f"You are already linked to company: {request.user.employer_profile.company.company_name}"
            }, status=400)
        
        # Link employer to existing company
        if hasattr(request.user, 'employer_profile'):
            request.user.employer_profile.company = company
            request.user.employer_profile.save()
            
            return Response({
                "message": f"Successfully linked to existing company: {company.company_name}",
                "company_id": company.id,
                "company_name": company.company_name,
                "is_existing": True
            }, status=200)
        
        return Response({"error": "Employer profile not found"}, status=400)        
 
    

# ============ OTP VIEWS ============

class SendEmailOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email is required"}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already registered"}, status=400)

        otp = generate_otp()

        EmailOTP.objects.create(
            email=email,
            otp=otp,
            purpose="email_verification",
            expires_at=timezone.now() + timedelta(minutes=10)
        )

        send_email_otp(email, otp, "signup")

        return Response({"message": "OTP sent to email"})


class VerifyEmailOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        otp_obj = EmailOTP.objects.filter(
            email=email,
            otp=otp,
            purpose="email_verification",
            is_verified=False
        ).last()

        if not otp_obj or not otp_obj.is_valid():
            return Response({"error": "Invalid or expired OTP"}, status=400)

        otp_obj.is_verified = True
        otp_obj.save()

        return Response({"message": "Email verified successfully"})


class SendLoginOTPView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        email = request.data.get("email")
 
        if not email:
            return Response({"error": "Email is required"}, status=400)
 
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User not found. Please sign up first."}, status=404)
 
        EmailOTP.objects.filter(email=email, purpose="login").delete()
 
        otp = generate_4digit_otp()
 
        EmailOTP.objects.create(
            email=email,
            otp=otp,
            purpose="login",
            expires_at=timezone.now() + timedelta(minutes=5)
        )
 
        send_email_otp(email, otp, "login")
 
        print(f"🔐 Login OTP for {email}: {otp}")
 
        return Response({"message": "OTP sent successfully"})
 

class VerifyLoginOTPView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
 
        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=400)
 
        if len(otp) != 4:
            return Response({"error": "OTP must be 4 digits"}, status=400)
 
        otp_obj = EmailOTP.objects.filter(
            email=email,
            otp=otp,
            purpose="login",
            is_verified=False
        ).last()
 
        if not otp_obj or not otp_obj.is_valid():
            return Response({"error": "Invalid or expired OTP"}, status=400)
 
        otp_obj.is_verified = True
        otp_obj.save()
 
        user = User.objects.get(email=email)
        refresh = RefreshToken.for_user(user)
 
        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "user_type": user.user_type
            }
        })
 

# ============ REPORT A JOB ============

class SubmitComplaintView(APIView):
    permission_classes = [IsAuthenticated, IsJobSeeker]
 
    def post(self, request):
        serializer = ComplaintSerializer(data=request.data, context={'request': request})
 
        if serializer.is_valid():
            serializer.save(user=request.user)
 
            return Response(
                {"message": "Complaint submitted successfully"},
                status=status.HTTP_201_CREATED
            )
 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

class AdminComplaintListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def get(self, request):
        complaints = Complaint.objects.all().order_by('-created_at')
 
        status_filter = request.GET.get("status")
        if status_filter:
            complaints = complaints.filter(status=status_filter)
 
        serializer = ComplaintSerializer(complaints, many=True)
        return Response(serializer.data)
 

class AdminUpdateComplaintView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def patch(self, request, pk):
        try:
            complaint = Complaint.objects.get(id=pk)
        except Complaint.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
 
        complaint.status = request.data.get("status", complaint.status)
        complaint.save()
 
        return Response({"message": "Status updated"})
    
# ============ BILLING VIEWS ============

from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from .models import *
from .serializers import *
from .services import create_order
from .utils import calculate_gst, generate_invoice_number, generate_invoice_pdf

class PlanListView(APIView):
    def get(self, request):
        return Response(PlanSerializer(Plan.objects.all(), many=True).data)


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        plan = get_object_or_404(Plan, id=plan_id)

        order = client.order.create({
            "amount": int(plan.price * 100),
            "currency": "INR",
            "payment_capture": 1
        })

        payment = Payment.objects.create(
            user=request.user,
            plan=plan,
            razorpay_order_id=order["id"],
            amount=plan.price,
            status="pending"
        )

        return Response({
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "payment_db_id": payment.id,
            "razorpay_key": settings.RAZORPAY_KEY
        })


class CurrentSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sub = Subscription.objects.filter(user=request.user, status='active').first()
        return Response(SubscriptionSerializer(sub).data if sub else {})


class CancelSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sub = Subscription.objects.filter(user=request.user, status='active').first()
        if sub:
            sub.status = "cancelled"
            sub.save()
        return Response({"message": "Cancelled"})


class InvoiceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        invoices = Invoice.objects.filter(user=request.user)
        return Response(InvoiceSerializer(invoices, many=True).data)


class InvoiceDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        invoice = Invoice.objects.get(id=pk, user=request.user)
        file_path = generate_invoice_pdf(invoice)
        return FileResponse(open(file_path, 'rb'), content_type='application/pdf')


class PaymentMethodView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(PaymentMethodSerializer(
            PaymentMethod.objects.filter(user=request.user), many=True).data)

    def post(self, request):
        serializer = PaymentMethodSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors)


class DeletePaymentMethodView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        PaymentMethod.objects.filter(id=pk, user=request.user).delete()
        return Response({"message": "Deleted"}) 

# ============ PAYMENT VERIFICATION VIEW ============

# jobapp/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decimal import Decimal

# Import your models
from jobapp.models import Payment, Subscription, Invoice

# Import utility functions - CHOOSE THE CORRECT ONE:
try:
    # Option 1: If functions are in utils.py
    from jobapp.utils import calculate_gst, generate_invoice_number, generate_invoice_pdf
except ImportError:
    # Option 2: If functions are in the same file (views.py)
    from jobapp.views import calculate_gst, generate_invoice_number, generate_invoice_pdf

class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data

        params_dict = {
            'razorpay_order_id': data['razorpay_order_id'],
            'razorpay_payment_id': data['razorpay_payment_id'],
            'razorpay_signature': data['razorpay_signature']
        }

        client.utility.verify_payment_signature(params_dict)

        payment = Payment.objects.get(
            razorpay_order_id=data['razorpay_order_id']
        )

        payment.razorpay_payment_id = data['razorpay_payment_id']
        payment.razorpay_signature = data['razorpay_signature']
        payment.status = "success"
        payment.save()

        Subscription.objects.filter(
            user=request.user,
            status='active'
        ).update(status='cancelled')

        subscription = Subscription.objects.create(
            user=request.user,
            plan=payment.plan
        )

        gst, total = calculate_gst(payment.amount)

        Invoice.objects.create(
            user=request.user,
            invoice_number=generate_invoice_number(),
            transaction_id=payment.razorpay_payment_id,
            subtotal=payment.amount,
            gst=gst,
            total=total,
            payment_status="Paid",
            plan_name=payment.plan.name,
            start_date=subscription.start_date,
            end_date=subscription.end_date
        )

        return Response({"message": "Payment verified successfully"})
    
# ============ COMPANY EMAIL OTP VIEWS ============

class SendCompanyEmailOTPView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        email = request.data.get("email")
        company_name = request.data.get("company_name")
        
        if not email:
            return Response({"error": "Email is required"}, status=400)
        
        if not company_name:
            return Response({"error": "Company name is required"}, status=400)
        
        # Check if email is already used by another company
        if CompanyProfile.objects.filter(company_email=email).exists():
            # If updating existing company, check if it's the same company
            if hasattr(request.user, 'employer_profile') and request.user.employer_profile.company:
                existing_company = request.user.employer_profile.company
                if existing_company.company_email != email:
                    return Response(
                        {"error": "This email is already used by another company"}, 
                        status=400
                    )
            else:
                return Response(
                    {"error": "This email is already registered with another company"}, 
                    status=400
                )
        
        # Delete existing OTPs for this email
        CompanyEmailOTP.objects.filter(
            email=email,
            purpose='company_verification',
            is_verified=False
        ).delete()
        
        otp = generate_company_otp()
        
        CompanyEmailOTP.objects.create(
            company_name=company_name,
            email=email,
            otp=otp,
            purpose='company_verification',
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        # Send OTP email
        try:
            send_company_email_otp(email, otp, company_name)
            print(f"📧 Company OTP sent to {email}: {otp}")  # For testing
            return Response({
                "message": "OTP sent to company email successfully",
                "email": email
            }, status=200)
        except Exception as e:
            return Response({
                "error": f"Failed to send OTP: {str(e)}"
            }, status=500)


class VerifyCompanyEmailOTPView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        
        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=400)
        
        otp_obj = CompanyEmailOTP.objects.filter(
            email=email,
            otp=otp,
            purpose='company_verification',
            is_verified=False
        ).last()
        
        if not otp_obj or not otp_obj.is_valid():
            return Response({"error": "Invalid or expired OTP"}, status=400)
        
        # Mark OTP as verified
        otp_obj.is_verified = True
        otp_obj.save()
        
        return Response({
            "message": "Email verified successfully",
            "verified": True
        }, status=200)    


class EmployerOnboardingStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.user_type != "employer":
            return Response(
                {"error": "Only employers allowed"},
                status=403
            )

        # ==================================
        # CORRECT COMPANY PROFILE CHECK
        # ==================================
        has_company_profile = False

        if hasattr(user, "employer_profile"):
            has_company_profile = (
                user.employer_profile.company is not None
            )

        # ==================================
        # VERIFICATION CHECK
        # ==================================
        verification = CompanyVerification.objects.filter(
            employer=user
        ).order_by("-id").first()

        has_verification = verification is not None

        verification_status = (
            verification.status
            if verification
            else None
        )

        return Response({
            "has_company_profile": has_company_profile,
            "has_verification": has_verification,
            "verification_status": verification_status
        })
    
# Google Login    
    
# Add these imports at top of views.py

from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, JobSeekerProfile, EmployerProfile


# Update your GoogleLoginView to this:

class GoogleLoginView(APIView):
    """
    Google Login API
    POST /api/google-login/ 
    Request body: {"id_token": "google_id_token"} or {"access_token": "google_access_token"}
    """
    permission_classes = [AllowAny]

    def post(self, request):
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        from django.conf import settings
        from rest_framework_simplejwt.tokens import RefreshToken
        
        # Try to get token from different possible field names
        id_token_str = request.data.get('id_token') or request.data.get('access_token') or request.data.get('token')
        
        if not id_token_str:
            return Response(
                {"error": "Google token required. Please provide 'id_token' or 'access_token'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get Google Client ID from settings
            google_client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
            
            if not google_client_id:
                return Response(
                    {"error": "Google Client ID not configured in settings"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            print(f"Using Google Client ID: {google_client_id}")
            print(f"Token received: {id_token_str[:50]}...")
            
            # Verify Google ID token
            info = id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                google_client_id
            )
            
            # Extract user info
            email = info.get('email')
            name = info.get('name', '')
            
            if not email:
                return Response(
                    {"error": "Email not provided by Google"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create user
            user = User.objects.filter(email=email).first()
            is_new_user = False
            
            if not user:
                # Create username from email
                username = email.split('@')[0]
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                # Create new user
                user = User.objects.create(
                    username=username,
                    email=email,
                    user_type=User.UserType.JOBSEEKER,
                    is_active=True
                )
                user.set_unusable_password()
                user.save()
                
                # Create jobseeker profile if the model exists
                try:
                    if not hasattr(user, 'jobseeker_profile'):
                        JobSeekerProfile.objects.create(
                            user=user,
                            full_name=name
                        )
                except Exception as e:
                    print(f"Could not create profile: {e}")
                
                is_new_user = True
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'user_type': user.user_type,
                },
                'is_new_user': is_new_user
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            error_msg = str(e)
            print(f"Token verification error: {error_msg}")
            return Response(
                {"error": f"Invalid Google token: {error_msg}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response(
                {"error": f"Authentication failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
 
    

from rest_framework.permissions import BasePermission
class IsAdminUserType(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.user_type == 'admin'
        )

 
class DashboardView(APIView):
 
    def get(self, request):
        today = timezone.now().date()
        week_start = today - timedelta(days=7)
        last_2_days = today - timedelta(days=2)
        last_month = today - timedelta(days=30)
 
       
        user_stats = User.objects.aggregate(
            new_today=Count('id', filter=Q(date_joined__date=today)),
            new_week=Count('id', filter=Q(date_joined__date__gte=week_start)),
 
            active_today=Count('id', filter=Q(user_type="employer", last_seen__date=today)),
            active_week=Count('id', filter=Q(user_type="employer", last_seen__date__gte=week_start)),
 
            login_today=Count('id', filter=Q(last_seen__date=today)),
 
            new_employers=Count('id', filter=Q(user_type="employer", date_joined__date=today)),
        )
 
       
        job_stats = PostAJob.objects.aggregate(
            total=Count('id'),
            today=Count('id', filter=Q(created_at__date=today)),
            week=Count('id', filter=Q(created_at__date__gte=week_start)),
 
            rejected=Count('id', filter=Q(employer__company_verification__status="Reject")),
            approved=Count('id', filter=Q(employer__company_verification__status="Verified")),
 
            expired=Count('id', filter=Q(last_date_to_apply__lt=today)),
        )
 
       
        app_stats = JobApplication.objects.aggregate(
            total=Count('id'),
            today=Count('id', filter=Q(applied_date__date=today)),
            week=Count('id', filter=Q(applied_date__date__gte=week_start)),
 
            last_2_days=Count('id', filter=Q(applied_date__date__gte=last_2_days)),
            last_month=Count('id', filter=Q(applied_date__date__gte=last_month)),
 
            shortlisted=Count('id', filter=Q(status="shortlisted")),
            interviews=Count('id', filter=Q(status="interview_called")),
            rejected=Count('id', filter=Q(status="rejected")),
        )
 
       
        profile_update = (
            JobSeekerProfile.objects.filter(updated_at__date=today).count()
            + EmployerProfile.objects.filter(updated_at__date=today).count()
            + AdminProfile.objects.filter(updated_at__date=today).count()
        )
 
        suspicious_activity = Complaint.objects.filter(
    status=Complaint.Status.INVESTIGATING
).count()
 
        messages_sent = Message.objects.count()
        support_tickets = RaiseTicket.objects.count()
        emails_sent = EmailOTP.objects.count() + CompanyEmailOTP.objects.count()
 
       
        return Response({
            "admin_activity_monitoring": {
                "new_user_registrations": {
                    "today": user_stats["new_today"],
                    "this_week": user_stats["new_week"],
                },
                "job_posted": {
                    "today": job_stats["today"],
                    "this_week": job_stats["week"],
                },
                "total_applications": {
                    "today": app_stats["today"],
                    "this_week": app_stats["week"],
                },
                "active_employers": {
                    "today": user_stats["active_today"],
                    "this_week": user_stats["active_week"],
                },
            },
            "platform_activity_overview": {
                "user_activity": {
                    "login_today": user_stats["login_today"],
                    "profile_update": profile_update,
                    "suspicious_activity": suspicious_activity,
                },
                "application_status": {
                    "total_application": app_stats["total"],
                    "shortlisted": app_stats["shortlisted"],
                    "interviews": app_stats["interviews"],
                    "rejections": app_stats["rejected"],
                },
                "employer_activity": {
                    "new_employers": user_stats["new_employers"],
                    "job_postings": job_stats["total"],
                    "rejected_jobs": job_stats["rejected"],
                },
            },
            "job_communication": {
                "job_tracking": {
                    "job_posted": job_stats["total"],
                    "job_approved": job_stats["approved"],
                    "expired_jobs": job_stats["expired"],
                },
                "communication_logs": {
                    "messages_sent": messages_sent,
                    "support_tickets": support_tickets,
                    "emails_sent": emails_sent,
                },
                "employer_activity": {
                    "applications_last_2_days": app_stats["last_2_days"],
                    "applications_last_week": app_stats["week"],
                    "applications_last_month": app_stats["last_month"],
                },
            },
        })
 
 
 
class AdminCompanyListView(APIView):
    #permission_classes = [IsAuthenticated, IsAdminUserType] enable in prod
    def get(self, request):
        queryset = CompanyVerification.objects.select_related('employer')
        serializer = AdminCompanySerializer(queryset, many=True)
        return Response(serializer.data)
 
class UpdateCompanyStatusView(APIView):
    #permission_classes = [IsAuthenticated, IsAdminUserType] enable in prod
    def patch(self, request, pk):
        try:
            obj = CompanyVerification.objects.get(id=pk)
        except CompanyVerification.DoesNotExist:
            return Response(
                {"error": "Company not found"},
                status=status.HTTP_404_NOT_FOUND
            )
 
     
        if set(request.data.keys()) != {"status"}:
            return Response(
                {"error": "Only 'status' field is allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        verification = request.data.get("status")
 
        valid_values = [choice[0] for choice in CompanyVerification.STATUS_CHOICES]
 
        if verification not in valid_values:
            return Response(
                {"error": f"Invalid value. Allowed: {valid_values}"},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        previous = obj.status
        obj.status = verification  
        obj.save()
 
        return Response({
            "message": "Updated successfully",
            "previous": previous,
            "verification": obj.status
        })
   
 
#admin

class AdminLoginView(APIView):
    """
    Admin-specific login.
    Accepts: { "email": "...", "password": "..." }
    Returns: { access, refresh, user: { id, email, username, user_type } }
    Only allows users with user_type == 'admin'.
    """
    permission_classes = [AllowAny]
 
    def post(self, request):
        email    = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip()
 
        # ── Field-level validation ──────────────────────────
        errors = {}
        if not email:
            errors['email'] = 'Email is required.'
        if not password:
            errors['password'] = 'Password is required.'
        if errors:
            return Response({'success': False, 'errors': errors},
                            status=status.HTTP_400_BAD_REQUEST)
 
        # ── Find user by email ──────────────────────────────
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {'success': False, 'errors': {'email': 'No account found with this email.'}},
                status=status.HTTP_401_UNAUTHORIZED
            )
 
        # ── Check it's an admin account ─────────────────────
        if user.user_type != 'admin':
            return Response(
                {'success': False, 'errors': {'email': 'This account does not have admin access.'}},
                status=status.HTTP_403_FORBIDDEN
            )
 
        # ── Check password ──────────────────────────────────
        if not user.check_password(password):
            return Response(
                {'success': False, 'errors': {'password': 'Incorrect password.'}},
                status=status.HTTP_401_UNAUTHORIZED
            )
 
        # ── Check active ────────────────────────────────────
        if not user.is_active:
            return Response(
                {'success': False, 'errors': {'email': 'This account is disabled.'}},
                status=status.HTTP_403_FORBIDDEN
            )
 
        # ── Generate JWT tokens ─────────────────────────────
        refresh = RefreshToken.for_user(user)
 
        return Response({
            'success': True,
            'message': 'Admin login successful.',
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id':        user.id,
                'email':     user.email,
                'username':  user.username,
                'user_type': user.user_type,
            }
        }, status=status.HTTP_200_OK)