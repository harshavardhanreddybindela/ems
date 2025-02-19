import base64
from django import template

register = template.Library()

@register.filter(name='base64')
def base64_filter(value):
    """
    Convert image data to base64 encoding for use in templates.
    Assumes `value` is binary data from a file or image.
    """
    return base64.b64encode(value).decode('utf-8') if value else ''
