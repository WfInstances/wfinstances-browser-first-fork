from datetime import datetime, timedelta
from collections import defaultdict
import ipinfo
import os

def get_week_range(date):
    # Get the start (Sunday) and end (Saturday) of the week
    start_of_week = date - timedelta(days=date.weekday() + 1)
    end_of_week = start_of_week + timedelta(days=6)
    return start_of_week.strftime('%Y-%m-%d'), end_of_week.strftime('%Y-%m-%d')

def group_by_week(data, field_name):
    # Using a default dictionary to group data by week
    weekly_data = defaultdict(lambda: {field_name: 0, "ips": set()})

    for item in data:
        date = datetime.strptime(item['date'], '%Y-%m-%d')
        week_start, week_end = get_week_range(date)
        week = f"{week_start} - {week_end}"

        # Check if 'num_instances' exists, if not count as 1 (for _id-based counting)
        num_instances = item.get('num_instances', 1)  # Defaults to 1 if not present

        # Increment the appropriate field (downloads, visualizations, etc.)
        weekly_data[week][field_name] += num_instances
        weekly_data[week]["ips"].add(item["ip"])  # Add the IP to the set

    # Format the output, converting the IP sets to lists
    result = [{
        "week": week,
        field_name: weekly_data[week][field_name],
        "ips": list(weekly_data[week]["ips"])
    } for week in weekly_data]

    return result


def get_ip_country_name(ip_string):
    try:
        access_token = os.getenv("IPINFO_TOKEN")
        handler = ipinfo.getHandler(access_token)
        details = handler.getDetails(ip_string)
        return details.details["country_name"]
    except Exception:
        return None


