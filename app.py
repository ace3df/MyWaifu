from flask import *
from flask_jsglue import JSGlue

from flask_oauthlib.client import OAuth
import requests
import string
import random
import tweepy

from config import CONFIG


oauth = OAuth()
twitter = oauth.remote_app(
    base_url='https://api.twitter.com/1.1/',
    request_token_url='https://api.twitter.com/oauth/request_token',
    access_token_url='https://api.twitter.com/oauth/access_token',
    authorize_url='https://api.twitter.com/oauth/authorize',
    consumer_key=CONFIG['twi_consumer_key'],
    consumer_secret=CONFIG['twi_consumer_secret'],
    name='twitter'
)

app = Flask(__name__)
jsglue = JSGlue(app)
app.config['SESSION_TYPE'] = 'memcached'
app.config['SECRET_KEY'] = "fasfasfasfasfasfgasgas"
user_store = {}  # Only need this for local user


def delete_dup_acc_list(twitter_id):
    # User has re-connected Twitter, delete dup
    acc_list = open(CONFIG['acc_file'], 'r').read().splitlines()
    line_count = 0
    for acc in acc_list:
        # acc[0] Twitter | acc[1] Twitch
        acc = acc.split("||")
        if twitter_id == acc[0]:
            del acc_list[line_count]
            break
        line_count += 1
    open(CONFIG['acc_file'], 'w').write("\n".join(acc_list))


def add_to_acc_list(twitter_id, twitch_username):
    # User has re-connected Twitter, delete dup
    # First make sure not already in list if so delete
    delete_dup_acc_list(twitter_id)
    acc_list = open(CONFIG['acc_file'], 'r').read().splitlines()
    acc_list.append("{}||{}".format(twitter_id, twitch_username))
    open(CONFIG['acc_file'], 'w').write("\n".join(acc_list))


@app.route('/get/<twitch_username>')
def get_twitter_username(twitch_username):
    # Should REALLY use twitch ID but name change isn't possible much right now
    # If it DOES happen there is a easy api to go at.
    acc_list = open(CONFIG['acc_file'], 'r').read().splitlines()
    for acc in acc_list:
        # acc[0] Twitter | acc[1] Twitch
        acc = acc.split("||")
        if twitch_username.lower() == acc[1].lower():
            return acc[0]
    return "Not Found!"


@app.route('/')
def home_show():
    if user_store.get('twitter_id'):
        if request.args.get('twitch_oauth'):
            # Logged in correctly for Twitch
            r = requests.get("https://api.twitch.tv/kraken?oauth_token=" +
                             request.args.get('twitch_oauth'))
            twitch_username = r.json()['_links']['channels'].split("/")[-1]
            add_to_acc_list(str(user_store.get('twitter_id')),
                            str(twitch_username.lower()))
            flash("You can now use MyWaifu / MyHusbando on Twitch! "\
                  "Read the footer of the site to learn how to disconnect your accounts.")
    return render_template('test.html')


@app.route('/app-twitter')
def app_show():
    return twitter.authorize(callback=url_for('oauth_authorized',
                             next=request.args.get('next')
                             or request.referrer or None))


@twitter.tokengetter
def get_twitter_token(token=None):
    return session.get('twitter_token')


@app.route('/oauth-authorized', methods=['GET'])
@twitter.authorized_handler
def oauth_authorized(resp):
    if resp is None:
        flash(u'You denied the request to sign in.')
        return redirect(url_for('home_show'))
    session['twitter_token'] = (
        resp['oauth_token'],
        resp['oauth_token_secret']
    )
    # TODO: There HAS to be a way to do this without using Tweepy
    # does flask_oauthlib really just store twitter_username?? dunno
    auth = tweepy.OAuthHandler(CONFIG['twi_consumer_key'],
                               CONFIG['twi_consumer_secret'])
    auth.set_access_token(resp['oauth_token'], resp['oauth_token_secret'])
    api = tweepy.API(auth)
    user_store['twitter_id'] = api.me().id
    delete_dup_acc_list(str(user_store['twitter_id']))
    return redirect(url_for('twitch_oauth_authorized'))


@app.route('/app-twitch-token')
def twitch2():
    if not user_store.get('twitter_id'):
        return redirect(url_for('home_show'))
    url = r"https://api.twitch.tv/kraken/oauth2/token"\
          "?client_id=" + CONFIG['twitch_client_id'] +\
          "&client_secret=" + CONFIG['twitch_client_secret'] +\
          "&grant_type=authorization_code"\
          "&redirect_uri=" + CONFIG['url_start'] + "/app-twitch-token"\
          "&code=" + request.args.get('code') +\
          "&state=" +\
          ''.join(random.SystemRandom().choice(
                  string.ascii_uppercase + string.digits) for _ in range(10))
    r = requests.post(url)
    return redirect(url_for('home_show',
                            twitch_oauth=r.json()['access_token']))


@app.route('/app-twitch')
def twitch_oauth_authorized():
    if not user_store.get('twitter_id'):
        return redirect(url_for('home_show'))
    url = r"https://api.twitch.tv/kraken/oauth2/authorize"\
          "?response_type=code&client_id=" + CONFIG['twitch_client_id'] +\
          "&redirect_uri=" + CONFIG['url_start'] + "/app-twitch-token"
    return redirect(url)


if __name__ == '__main__':
    app.run()
