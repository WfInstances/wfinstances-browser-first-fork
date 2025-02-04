# Meeting Minutes
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
