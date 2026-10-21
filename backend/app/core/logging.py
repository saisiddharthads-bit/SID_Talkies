import logging
import sys

def setup_logging():
    logger = logging.getLogger("sid_talkies")
    logger.setLevel(logging.INFO)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger

app_logger = setup_logging()

def log_security_event(event_type: str, user_id: str, detail: str):
    """
    Safely logs security-relevant events without dumping private conversational data.
    """
    app_logger.info(f"SECURITY_EVENT | Type: {event_type} | User: {user_id} | Detail: {detail}")
