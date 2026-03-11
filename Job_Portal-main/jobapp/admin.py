from django.contrib import admin
from .models import (
    AdminProfile,
    EducationEntry,
    WorkExperienceEntry,
    Skill,
    LanguageKnown,
    Certification,
    Company,
    EmployerProfile,
    Job,
    JobApplication,
    SavedJob,
    NewsletterSubscriber,
    Notification,
    Conversation,
    Message,
    ChatMessage,
    HelpTopic,
    RaiseTicket,
    ContactMessage,
    CompanyVerification,
    PostAJob
    
)

# -------------------------
# INLINE CONFIGURATION
# -------------------------

class EducationInline(admin.TabularInline):
    model = EducationEntry
    extra = 0


class ExperienceInline(admin.TabularInline):
    model = WorkExperienceEntry
    extra = 0


class SkillInline(admin.TabularInline):
    model = Skill
    extra = 0


class LanguageInline(admin.TabularInline):
    model = LanguageKnown
    extra = 0


class CertificationInline(admin.TabularInline):
    model = Certification
    extra = 0


# -------------------------
# COMPANY ADMIN
# -------------------------

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("custom_id", "name", "industry", "is_active", "created_at")
    search_fields = ("name", "industry")
    list_filter = ("is_active", "industry")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


# -------------------------
# EMPLOYER ADMIN
# -------------------------

@admin.register(EmployerProfile)
class EmployerAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "company", "created_at")
    search_fields = ("full_name", "user__email")
    list_filter = ("company",)


# -------------------------
# ADMIN PROFILE
# -------------------------

@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "department", "access_level", "created_at")
    search_fields = ("user__email", "department")


# -------------------------
# JOB ADMIN
# -------------------------

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "location", "job_type", "is_active", "posted_date")
    list_filter = ("job_type", "work_type", "is_active")
    search_fields = ("title", "company__name")
    readonly_fields = ("applicants_count",)


# -------------------------
# JOB APPLICATION ADMIN
# -------------------------

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("user", "job", "status", "applied_date")
    list_filter = ("status",)
    search_fields = ("user__email", "job__title")
    readonly_fields = ("applied_date",)


# -------------------------
# SAVED JOBS
# -------------------------

@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ("user", "job", "saved_date")
    search_fields = ("user__email", "job__title")


# -------------------------
# NEWSLETTER
# -------------------------

@admin.register(NewsletterSubscriber)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ("email", "is_active", "subscribed_at")
    search_fields = ("email",)
    list_filter = ("is_active",)


# -------------------------
# NOTIFICATIONS
# -------------------------

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "is_read", "created_at")
    list_filter = ("is_read",)
    search_fields = ("user__email",)


# -------------------------
# CHAT SYSTEM
# -------------------------

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "initiated_by", "jobseeker_can_reply", "updated_at")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("conversation", "sender", "receiver", "timestamp", "is_read")
    search_fields = ("sender__email", "receiver__email")
    readonly_fields = ("timestamp",)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("sender", "created_at")
    readonly_fields = ("created_at",)


# -------------------------
# HELP SYSTEM
# -------------------------

@admin.register(HelpTopic)
class HelpTopicAdmin(admin.ModelAdmin):
    list_display = ("title", "path")


@admin.register(RaiseTicket)
class RaiseTicketAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "category", "subject", "created_at")
    list_filter = ("category", "subject", "created_at")
    search_fields = ("name", "email", "subject")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)



from django.contrib import admin
from django.contrib.sessions.models import Session
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()


class ActiveUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'email', 'session_key', 'expire_date')
    readonly_fields = ('user', 'email', 'session_key', 'expire_date')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(expire_date__gte=timezone.now())

    def user(self, obj):
        data = obj.get_decoded()
        user_id = data.get('_auth_user_id')
        if user_id:
            return User.objects.filter(id=user_id).first()
        return None

    def email(self, obj):
        data = obj.get_decoded()
        user_id = data.get('_auth_user_id')
        if user_id:
            user = User.objects.filter(id=user_id).first()
            if user:
                return user.email
        return None


admin.site.register(Session, ActiveUserAdmin)
 
@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "contact","message", "created_at")
    search_fields = ("name", "email", "contact")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)

@admin.register(CompanyVerification)
class CompanyVerificationAdmin(admin.ModelAdmin):
 
    list_display = ("legal_name","official_email","phone_number","status","created_at")
    list_filter = ("status",)

@admin.register(PostAJob)
class PostAJobAdmin(admin.ModelAdmin):
    list_display = (
        'job_title',
        'location',
        'salary',
        'created_at'
    )
from django.contrib.auth import get_user_model

User = get_user_model()

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'user_type', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_active')
    search_fields = ('username', 'email')
    readonly_fields = ('date_joined', 'last_login')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone', 'user_type')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
from .models import JobSeekerProfile  # Add this import if not already present

@admin.register(JobSeekerProfile)
class JobSeekerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'current_job_title', 'current_location', 'total_experience_years')
    search_fields = ('user__email', 'full_name', 'phone')  # phone? Actually JobSeekerProfile has no direct phone field; it has alternate_phone, and user model has phone. We can use user__phone.
    list_filter = ('gender', 'current_location')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('user', 'full_name', 'profile_photo')}),
        ('Personal Info', {'fields': ('gender', 'dob', 'marital_status', 'nationality')}),
        ('Contact Details', {'fields': ('alternate_phone', 'alternate_email', 'full_address', 'street', 'city', 'state', 'pincode', 'country')}),
        ('Professional Details', {'fields': ('current_job_title', 'current_company', 'total_experience_years', 'notice_period', 'current_location', 'preferred_locations')}),
        ('Resume & Portfolio', {'fields': ('resume_file', 'portfolio_link')}),
        ('Career Preferences', {'fields': ('current_ctc', 'expected_ctc', 'preferred_job_type', 'preferred_role_industry', 'ready_to_start_immediately', 'willing_to_relocate')}),
        ('Meta', {'fields': ('created_at', 'updated_at')}),
    )
    inlines = [
        EducationInline,
        ExperienceInline,
        SkillInline,
        LanguageInline,
        CertificationInline
    ]