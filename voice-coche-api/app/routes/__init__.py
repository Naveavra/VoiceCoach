from .authRoutes import init_auth_routes
from .fileRoutes import init_file_routes
from .projectRoutes import init_project_routes


def init_routes(app,login_manager,mail):
    init_auth_routes(app,login_manager,mail)
    init_project_routes(app)
    init_file_routes(app)