from datetime import datetime, timedelta, time, timezone
from sqlalchemy import and_

def apply_date_filter(query, model, filter_type: str | None = None, start_date: str | None = None, end_date: str | None = None):
    if not hasattr(model, "created_at"):
        return query

    now = datetime.now(timezone.utc)
    if filter_type == "today":
        today_start = datetime.combine(now.date(), time.min).replace(tzinfo=timezone.utc)
        today_end = datetime.combine(now.date(), time.max).replace(tzinfo=timezone.utc)
        query = query.where(and_(model.created_at >= today_start, model.created_at <= today_end))
    elif filter_type == "week":
        start_of_week = datetime.combine(now.date() - timedelta(days=now.weekday()), time.min).replace(tzinfo=timezone.utc)
        query = query.where(model.created_at >= start_of_week)
    elif filter_type == "month":
        start_of_month = datetime.combine(now.date().replace(day=1), time.min).replace(tzinfo=timezone.utc)
        query = query.where(model.created_at >= start_of_month)
    elif filter_type == "custom":
        if start_date:
            try:
                parsed_start = datetime.fromisoformat(start_date)
                if parsed_start.tzinfo is None:
                    parsed_start = parsed_start.replace(tzinfo=timezone.utc)
                query = query.where(model.created_at >= parsed_start)
            except ValueError:
                pass
        if end_date:
            try:
                parsed_end = datetime.fromisoformat(end_date)
                if parsed_end.tzinfo is None:
                    parsed_end = parsed_end.replace(tzinfo=timezone.utc)
                query = query.where(model.created_at <= parsed_end)
            except ValueError:
                pass
    return query
