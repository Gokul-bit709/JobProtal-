# tasks.py

from celery import shared_task

from django.contrib.auth import get_user_model

from .models import (
    Subscription,
    EmployerPlatformSettings
)

from .services import NotificationService

User = get_user_model()


@shared_task
def send_weekly_summary_notifications():

    employers = User.objects.filter(
        user_type="employer"
    )

    print("celery working")

    for employer in employers:

        subscription = (
            Subscription.objects.filter(
                user=employer,
                status='active'
            )
            .select_related('plan')
            .first()
        )

        if not subscription:

            continue

        platform = (
            EmployerPlatformSettings.objects.filter(
                plan=subscription.plan
            ).first()
        )

        if not platform:

            continue

        # ─────────────────────────────
        # WEEKLY SUMMARY DISABLED
        # ─────────────────────────────

        if not platform.notif_weekly_summary:

            continue

        # ─────────────────────────────
        # CREATE NOTIFICATION
        # ─────────────────────────────

        NotificationService.create_notification(

            recipient=employer,

            title="Weekly Summary Ready",

            message=(

                "Your weekly employer summary "

                "is now available. "

                "View report at: "

                "/employer/dashboard/weekly-summary"
            ),

            category="weekly_summary",

            event_type="weekly_report",

            notification_type="system"
        )
