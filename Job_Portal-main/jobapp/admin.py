from django.contrib import admin

# Register your models here.

from django.contrib import admin
from .models import RaiseTicket
 
 
@admin.register(RaiseTicket)
class RaiseTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'category', 'subject', 'created_at')
    list_filter = ('category', 'subject', 'created_at')
    search_fields = ('name', 'email', 'subject')
    readonly_fields = ('created_at',)