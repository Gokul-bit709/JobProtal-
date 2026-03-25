from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AdminUpdateComplaintView,
    CompanyProfileCreateView,
    JobSeekerRegistrationView,
    EmployerRegistrationView,
    LoginView,
    LogoutView,
    JobSeekerProfileView,
    EmployerProfileView,
    MarkNotificationUnreadView,
    DeleteNotificationView,
    ClearAllNotificationsView,
    NewsletterSubscribeAPIView,
    SubmitComplaintView,
    UserSettingsView,
    SaveJobView,
    JobApplicationDetailView,
    ConversationListView,
    ConversationDetailView,
    ConversationMessagesView,
    MarkConversationReadView,
    SendMessageView,
    UnreadCountView,
    ConversationWithUserView,
    MarkMessageReadView,
    ChatUsersView,
    EmployerInitiateChatView,
    VerifyEmailOTPView,
    chat_api,
    ForgotPasswordView,
    ResetPasswordConfirmView,
    CreatePasswordView,
    ValidateResetTokenView,
    AdminCreatePasswordTokenView,
    RaiseTicketCreateView,
    ContactMessageCreateAPIView,
    SubmitCompanyVerification,
    CompanyVerificationAction,
    CreateJobPreviewView,
    PreviewJobView,
    PublishJobView,
    UpdateJobView,
    DeleteJobView,
    JobListView,
    CompanyProfileDetailView,
    CompanyProfileUpdateView,AdminComplaintListView,
    SendEmailOTPView,

)
from . import views 
 

urlpatterns = [
    # Registration (open to everyone)
    path('register/jobseeker/', JobSeekerRegistrationView.as_view(), name='jobseeker-register'),
    path('register/employer/', EmployerRegistrationView.as_view(), name='employer-register'),

    # JWT Auth
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Profile (only authenticated users)
    path('profile/jobseeker/', JobSeekerProfileView.as_view(), name='jobseeker-profile'),
    path('jobseekers/', views.JobSeekerListView.as_view(), name='jobseeker-list'),
    path('profile/employer/', EmployerProfileView.as_view(), name='employer-profile'),

    # Companies
    path('companies/', views.CompanyListView.as_view(), name='company-list'),
    path('companies/<int:pk>/', views.CompanyDetailView.as_view(), name='company-detail'),
    path('companies/create/', views.CompanyCreateView.as_view(), name='company-create'),
    path('companies/link/', views.CompanyLinkView.as_view(), name='company-link'),  # PATCH to link existing
    path('companies/<int:pk>/edit/', views.CompanyEditView.as_view(), name='company-edit'),
    path('admin/companies/<int:pk>/toggle-active/', views.AdminCompanyToggleActiveView.as_view(), name='admin-company-toggle'),

    # Jobs
    path('jobs/', views.JobListView.as_view(), name='job-list'),
    path('jobs/<int:pk>/', views.JobDetailView.as_view(), name='job-detail'),
    path('jobs/create/', views.JobCreateView.as_view(), name='job-create'),
    path('jobs/<int:pk>/update/', views.JobUpdateView.as_view(), name='job-update'),
    path('jobs/<int:pk>/delete/', views.JobDeleteView.as_view(), name='job-delete'),
    path('jobs/<int:pk>/toggle-active/', views.JobToggleActiveView.as_view(), name='job-toggle-active'),

    # Applications & Saved
    path('jobs/apply/', views.ApplyJobView.as_view(), name='job-apply'),
    path('jobs/applied/', views.AppliedJobsListView.as_view(), name='applied-jobs'),
    path('jobs/save/', views.SaveJobView.as_view(), name='job-save'),
    path('jobs/saved/', views.SavedJobsListView.as_view(), name='saved-jobs'),

    #Withdraw application
    path('jobs/applications/<int:pk>/withdraw/', views.WithdrawApplicationView.as_view(), name='withdraw-application'),

    # Employer sees applications
    path('jobs/applications/', views.EmployerApplicationsListView.as_view(), name='employer-applications'),
    path('jobs/applications/<int:pk>/status/', views.EmployerApplicationStatusUpdateView.as_view(), name='employer-application-status-update'),

    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', views.MarkNotificationReadView.as_view(), name='mark-notification-read'),
 
    path('notifications/<int:pk>/unread/', MarkNotificationUnreadView.as_view()),
    path('notifications/<int:pk>/delete/', DeleteNotificationView.as_view()),
    path('notifications/clear-all/', ClearAllNotificationsView.as_view()),
   
    path("settings/", UserSettingsView.as_view(), name="user-settings"),
    path("jobs/save/", SaveJobView.as_view(), name="save-job"),
    path("jobs/save/<int:job_id>/", SaveJobView.as_view(), name="remove-saved-job"),
    path("jobs/applications/<int:pk>/", JobApplicationDetailView.as_view()),
 
    # Conversations
    path('chat/conversations/', ConversationListView.as_view(), name='chat-conversations'),
    path('chat/conversations/<int:pk>/', ConversationDetailView.as_view(), name='chat-conversation-detail'),
    path('chat/conversations/<int:pk>/messages/', ConversationMessagesView.as_view(), name='chat-conversation-messages'),
    path('chat/conversations/<int:pk>/mark-read/', MarkConversationReadView.as_view(), name='chat-conversation-mark-read'),
    path('chat/messages/send/', SendMessageView.as_view(), name='chat-send-message'),
    path('chat/messages/unread/', UnreadCountView.as_view(), name='chat-unread-count'),
    path('chat/messages/<int:pk>/read/', MarkMessageReadView.as_view(), name='chat-mark-message-read'),
    path('chat/with-user/', ConversationWithUserView.as_view(), name='chat-with-user'),
    path('chat/users/', ChatUsersView.as_view(), name='chat-users'),
    path('chat/employer/initiate/', EmployerInitiateChatView.as_view(), name='employer-initiate-chat'),
    path("chat/", chat_api, name="chat_api"),
    # Password
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/reset-password-confirm/', ResetPasswordConfirmView.as_view(), name='reset-password-confirm'),
    path('auth/create-password/', CreatePasswordView.as_view(), name='create-password'),
    path('auth/validate-reset-token/', ValidateResetTokenView.as_view(), name='validate-reset-token'),
    path('admin/create-password-token/', AdminCreatePasswordTokenView.as_view(), name='admin-create-password-token'),
    # raise ticket
    path('raise-ticket/', RaiseTicketCreateView.as_view(), name='raise-ticket'),
    # contact 
    path('contact/', ContactMessageCreateAPIView.as_view(), name='contact-message'),
    # ----newsletter subscribe--------------------------------
    path("subscribe/", NewsletterSubscribeAPIView.as_view(), name="subscribe-newsletter"),
    # Company Verify 
    path("company/verify/",SubmitCompanyVerification.as_view()),
    path("admin/company-verification/<int:pk>/",CompanyVerificationAction.as_view()),
    # Post a Job
    path('job/create/', CreateJobPreviewView.as_view()),
    path('job/preview/<int:pk>/', PreviewJobView.as_view()),
    path('job/publish/<int:pk>/', PublishJobView.as_view()),
    path('job/update/<int:pk>/', UpdateJobView.as_view()),
    path('job/delete/<int:pk>/', DeleteJobView.as_view()),
    path('job/list/', JobListView.as_view()),
    # Verify Email OTP
    path('verify-email-otp/', VerifyEmailOTPView.as_view(), name='verify-email-otp'),
    path('send-email-otp/', SendEmailOTPView.as_view()),
 
    # About Company
    path('company/profile/create/', CompanyProfileCreateView.as_view()),
    path('company/profile/', CompanyProfileDetailView.as_view()),
    path('company/profile/update/', CompanyProfileUpdateView.as_view()),
    
    # Report A Job
    path('api/complaints/submit/',
         views.SubmitComplaintView.as_view(),
         name='submit_complaint'),
   
    path('api/complaints/job/<int:job_id>/status/',
         views.CheckJobReportStatusView.as_view(),
         name='check_job_report_status'),
   
    path('api/complaints/my-reports/',
         views.UserReportHistoryView.as_view(),
         name='my_reports'),
   
    # Admin endpoints
    path('api/admin/complaints/',
         views.AdminComplaintListView.as_view(),
         name='admin_complaints'),
   
    path('api/admin/complaints/<int:pk>/update/',
         views.AdminUpdateComplaintView.as_view(),
         name='update_complaint'),
   
    path('api/admin/companies/<int:company_id>/complaints/',
         views.AdminCompanyComplaintsView.as_view(),
         name='company_complaints'),
   
    path('api/admin/users/<int:user_id>/complaints/',
         views.AdminUserComplaintsView.as_view(),
         name='user_complaints'),
 

    # About Company
    path('company/profile/create/', CompanyProfileCreateView.as_view()),
    path('company/profile/', CompanyProfileDetailView.as_view()),
    path('company/profile/update/', CompanyProfileUpdateView.as_view()),
 

]
