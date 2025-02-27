## Meeting Minutes
#### Team: Jianlong Chen, Kenneth de Guzman

---
### Meeting 1 (Week: 1/21 - 1/27)

Date: Tuesday 1/21/25

Business:
- Project was introduced 
- Went over scope of project
- Discussed issues and project deliverables 

Actions: 
- Created WfInstances organization for team
- Forked WfInstances-browser repo
- Ran the app and populated the database
- Added a usage report button that opens a popup with placeholder text
---
### Meeting 2 (Week: 1/28 - 2/3)

Date: Tuesday 1/28/25

Business: 
- Talked about what usage report button should display to user
- Discussed ways to connect backend and frontend
- Went over how the API fetches data

Actions: 
- Created a new issue for making button display data to user
- Added a new totals endpoint to usage/router.py under api
- Modified UsageStatsModal.tsx to fetch data from the totals endpoint
- Went over how to show data better (graph, tabs for separate collections)
- Created button for user survey questionnaire
---
### Meeting 3 (Week: 2/4 - 2/8)

Date: Tuesday, 2/4/25 

Business: 
- Modified database to get accurate dump of usage stats
- Talked about ways to show location of where people are using the system (world map from IPs)
- Continued discussing potential ways to do the visualization of usage data

Actions:
- Created a new API endpoint for weekly usage data grouped by their type
- Implemented a linen chart graph for showing the frequency of what is used on the site
- Added buttons to switch between the three different usage types (downloads, visualizations, simulations)
---
### Meeting 4 (Week: 2/11 - 2/15)

Date: Tuesday, 2/11/25

Business:
- Discussed ways to add IP geolocation
- Went over setting up ipinfo_token to convert IP to a country name
- Sidebar should show countries that use what features of the site most

Actions:
- Implemented the feature to show top countries
- Edited get_ip_country_name in service.py to take in IP and return country name
- Added get_top_countries function in service.py to return top 10 countries where features are used most
- Added new endpoints for showing all distinct IPs and their country names and for showing top countries based on combined usage
---
### Meeting 5 (Week: 2/18 - 2/22)

Date: 2/18/25

Business: 
- Short meeting to talk about next steps for project
- Went over plan to add timescale feature to zoom in on graph 

Actions:
- Changed the usage graph to show data by month 
- Added another line in graph for distinct IPs for a month
---
### Meeting 6 (Week: 2/25 - 3/1)

Date: 2/25/25

Business: 
- Discussed implementing new way to populate the database
- Use git clone and git pull 

Actions:
- Make graph legend use lines instead of square/rectangle for representation
- Implement the new GitHub crawl (git clone)


