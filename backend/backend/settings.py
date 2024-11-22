"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 5.1.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
import string, random, smtplib, psycopg2
from email.mime.text import MIMEText
from datetime import datetime
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-&*9wp6*j8auiv(*5$ncdygy(3#a)-o1c48da_933l6d2aer5^a'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'appbackend', # uusgesen app-aa holboj ugch baina.
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

#Standartiin daguu response json-g 6 key-tei bolgoj beldej baina.
def sendResponse(request, resultCode, data, action="no action"):
    response = {} # response dictionary zarlaj baina
    response["resultCode"] = resultCode # 
    response["resultMessage"] = resultMessages[resultCode] #resultCode-d hargalzah message-g avch baina
    response["data"] = data
    response["size"] = len(data) # data-n urtiig avch baina
    response["action"] = action
    response["curdate"] = datetime.now().strftime('%Y/%m/%d %H:%M:%S') # odoogiin tsagiig response-d oruulj baina

    return response 
#   sendResponse

# result Messages. nemj hugjuuleerei
resultMessages = {
    200 : "Амжилттай",
    400 : "Буруу хүсэлт",
    404 : "Олдсонгүй.",
    1000 : "Бүртгэхгүй боломжгүй. Цахим шуудан өмнө нь бүртгэлтэй байна.",
    1001 : "Хэрэглэгч амжилттай бүртгэгдлээ. Баталгаажуулах мэйл илгээлээ. 24 цагийн дотор баталгаажуулна уу.",
    1002 : "Амжилттай нэвтэрлээ.",
    1003 : "Амжилттай баталгаажлаа.",
    1004 : "Хэрэглэгчийн нэр, нууц үг буруу байна.",    
    1005 : "edituser амжилттай",
    3001 : "ACTION буруу",
    3002 : "METHOD буруу",
    3003 : "JSON буруу",
    3004 : "Токений хугацаа дууссан. Идэвхгүй токен байна.",
    3005 : "NO ACTION",
    3006 : "Нэвтрэх сервис key дутуу",
    3007 : "Бүртгүүлэх сервисийн key дутуу",
    3008 : "Баталгаажсан хэрэглэгч байна",
    3009 : "Идэвхгүй токен эсвэл буруу токен байна",
    3010 : "Бүртгэл баталгаажлаа",
    3011 : "Мартсан нууц үг баталгаажлаа",
    3012 : "Мартсан нууц үг хүсэлт илгээлээ",
    3013 : "Нууц үг мартсан хэрэглэгч олдсонгүй",
    3014 : "Баталгаажсан хэрэглэгч байна. Өмнөх бүртгэлээрээ нэвтэрнэ үү. Имэйл холбоос",
    3015 : "no token parameter",
    3016 : "forgot service key дутуу", 
    3017 : "not forgot and register GET token",
    3018 : "reset password key дутуу",
    3019 : "Мартсан нууц үгийг шинэчиллээ.",
    3020 : "Идэвхгүй токен эсвэл буруу токен байна. Нууц үг шинэчилж чадсангүй.",
    3021 : "change password service key дутуу ",
    3022 : "Нууц үг амжилттай солигдлоо.",
    3023 : "Хуучин нууц үг таарсангүй",
    3024 : "edituser service key дутуу",
    5001 : "Нэвтрэх сервис дотоод алдаа",
    5002 : "Бүртгүүлэх сервис дотоод алдаа",
    5003 : "Forgot service дотоод алдаа",
    5004 : "GET method token дотоод алдаа",
    5005 : "reset password service дотоод алдаа ",
    5006 : "change password service дотоод алдаа ",
    5007 : "edituser service дотоод алдаа",
}
# resultMessage

# db connection
def connectDB():
    conn = psycopg2.connect (
        host = 'localhost', #server host
        # host = '59.153.86.251',
        dbname = 'projectzero', # database name
        user = 'postgres', # databse user 
        password = '1234', 
        port = '5432', # postgre port
    )
    return conn
# connectDB


# DB disconnect hiij baina
def disconnectDB(conn):
    conn.close()
# disconnectDB

#random string generating
def generateStr(length):
    characters = string.ascii_lowercase + string.digits # jijig useg, toonuud
    password = ''.join(random.choice(characters) for i in range(length)) # jijig useg toonuudiig token-g ugugdsun urtiin daguu (parameter length) uusgej baina
    return password # uusgesen token-g butsaalaa
# generateStr

#Mail yavuulah function
def sendMail(recipient, subj, bodyHtml):
    sender_email = "testmail@mandakh.edu.mn"
    sender_password = "Mandakh2"
    recipient_email = recipient
    subject = subj
    body = bodyHtml
    html_message = MIMEText(body, 'html')
    html_message['Subject'] = subject
    html_message['From'] = sender_email
    html_message['To'] = recipient_email
    with smtplib.SMTP('smtp-mail.outlook.com',587) as server:
        server.ehlo()
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, recipient_email, html_message.as_string())
        server.quit()
#sendMail