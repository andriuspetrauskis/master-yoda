#About
![avatar](https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2016-02-13/21283160480_c1d87bd3997db2a22bac_48.jpg "Yoda") **Master Yoda** *“Do. Or do not. There is no try.”*

What is this is? Yoda lives in Slack. Yoda peeks into League stash.
Tell Yoda LoL name used by you, and Yoda will say if good you do.

#Requirements
  - [nodejs](https://nodejs.org/en/)
  - [mongodb](https://www.mongodb.com/)
  - cron is set up for [openshift](https://www.openshift.com/) (optional)

#Installation
Checkout this repository and run `npm install`

#How to use
1. Configure [Slack slash command](https://api.slack.com/slash-commands) `/lol` pointing to your-server.com/api/lol
2. In a Slack channel type `/lol help`
