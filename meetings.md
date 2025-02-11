## Meeting Minutes
#### Team: Jianlong Chen, Kenneth de Guzman

---
### Meeting 1 (Week 1: 1/21 - 1/27)

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
### Meeting 2 (Week 2: 1/28 - 2/3)

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
### Meeting 3 (Week 3: 2/4 - 2/8)

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
### Meeting 4 (Week 4: 2/11 - 2/15)

Business:


Actions:
