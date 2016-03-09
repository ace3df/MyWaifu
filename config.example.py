import os

APP_ROOT = os.path.dirname(os.path.abspath(__file__))
APP_STATIC = os.path.join(APP_ROOT, 'static')

CONFIG = dict(
    acc_file=os.path.join(APP_STATIC, '.txt'), # Really don't need more than this
    twi_consumer_key='',
    twi_consumer_secret='',
    twitch_client_id='',
    twitch_client_secret='',
    url_start=r'',
)
