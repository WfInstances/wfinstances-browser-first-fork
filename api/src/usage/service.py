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
        # Check if 'num_instances' exists, if not count as 1
        num_instances = item.get('num_instances', 1)
        # Increment the appropriate field and add the IP to the set
        weekly_data[week][field_name] += num_instances
        weekly_data[week]["ips"].add(item["ip"])

    result = [{
        "week": week,
        field_name: weekly_data[week][field_name],
        "ips": list(weekly_data[week]["ips"])
    } for week in weekly_data]

    return result

def get_month_range(date):
    # Get the start of the month and return only the month name
    start_of_month = date.replace(day=1)
    return start_of_month.strftime('%B')  # Return the month name (e.g., "January")

def group_by_monthly(data, field_name):
    # Using a defaultdict to group data by month
    monthly_data = defaultdict(lambda: {field_name: 0, "ips": set()})

    for item in data:
        date = datetime.strptime(item['date'], '%Y-%m-%d')  
        month = get_month_range(date)  # Get the month name for the date

        # Get 'num_instances' value, defaulting to 1 if not present
        num_instances = item.get('num_instances', 1) 

        # Increment the appropriate field (downloads, visualizations, etc.)
        monthly_data[month][field_name] += num_instances
        monthly_data[month]["ips"].add(item["ip"])  # Add IP to the set to ensure uniqueness

    result = [{
        "month": month,  # Month name
        field_name: monthly_data[month][field_name],  # Total for the month
        "ips": list(monthly_data[month]["ips"])  # Unique IP addresses for the month
    } for month in monthly_data]

    return result

def get_ip_country_name(ip_list: list[str]) -> list[tuple[str, str]]:
    """
    Given a list of IP addresses, return a list of tuples (ip, country)
    where each distinct IP is resolved to a country.
    """
    result = []
    access_token = os.getenv("IPINFO_TOKEN")
    if not access_token:
        print("IPINFO_TOKEN environment variable is not set.")
    handler = ipinfo.getHandler(access_token)
    unique_ips = set(ip_list)
    for ip in unique_ips:
        try:
            details = handler.getDetails(ip)
            # Try 'country_name' first, then 'country'
            country = details.details.get("country_name") or details.details.get("country") or "Unknown"
        except Exception as e:
            print(f"Error fetching country for IP {ip}: {e}")
            country = "Unknown"
        result.append((ip, country))
    return result

def get_top_countries(ip_list: list[str]) -> list[tuple[str, int]]:
    """
    Given a list of IP addresses, resolve each to a country using get_ip_country_name,
    then aggregate and return the top 10 countries (as (country, count) tuples).
    """
    resolved = get_ip_country_name(ip_list)  # List of (ip, country)
    country_counts = {}
    for _, country in resolved:
        # Skip unknowns so they aren't counted
        if country == "Unknown":
            continue
        country_counts[country] = country_counts.get(country, 0) + 1
    sorted_countries = sorted(country_counts.items(), key=lambda x: x[1], reverse=True)
    return sorted_countries[:10]
