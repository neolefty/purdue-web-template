#!/usr/bin/env python3
"""
Send email notifications for GitOps deployments.
Uses SMTP relay (configured for Purdue's smtp.purdue.edu).
"""

import sys
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

def send_email(to_addr, subject, body):
    """Send email via SMTP relay."""

    # Configuration (can be overridden by environment variables)
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.purdue.edu')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))  # 587 for TLS, 25 for plain
    smtp_user = os.environ.get('SMTP_USER', '')  # Leave empty if no auth needed
    smtp_pass = os.environ.get('SMTP_PASS', '')
    from_addr = os.environ.get('EMAIL_FROM', f'gitops@{os.uname().nodename}')

    # Create message
    msg = MIMEMultipart()
    msg['From'] = from_addr
    msg['To'] = to_addr
    msg['Subject'] = subject
    msg['Date'] = datetime.now().strftime('%a, %d %b %Y %H:%M:%S %z')

    # Add body
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Connect to SMTP server
        if smtp_port == 465:
            # SSL
            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        else:
            # TLS or plain
            server = smtplib.SMTP(smtp_host, smtp_port)
            if smtp_port == 587:
                server.starttls()

        # Authenticate if credentials provided
        if smtp_user and smtp_pass:
            server.login(smtp_user, smtp_pass)

        # Send email
        server.send_message(msg)
        server.quit()
        return True

    except Exception as e:
        print(f"Failed to send email: {e}", file=sys.stderr)
        return False

if __name__ == '__main__':
    # Read stdin for email body (like the mail command)
    if len(sys.argv) < 3:
        print("Usage: send_email.py <to_address> <subject>", file=sys.stderr)
        print("Body is read from stdin", file=sys.stderr)
        sys.exit(1)

    to_address = sys.argv[1]
    subject = sys.argv[2]
    body = sys.stdin.read()

    if send_email(to_address, subject, body):
        sys.exit(0)
    else:
        sys.exit(1)
