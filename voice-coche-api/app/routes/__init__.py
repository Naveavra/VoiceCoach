from .authRoutes import init_auth_routes
from .fileRoutes import init_file_routes


def init_routes(app):
    init_auth_routes(app)
    init_file_routes(app)