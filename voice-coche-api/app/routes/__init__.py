from .parashaRoute import init_parasha_routes
from .authRoutes import init_auth_routes
from .fileRoutes import init_file_routes
from .projectRoutes import init_project_routes
from .sessionRoutes import init_session_routes
from .analysisRoutes import init_analysis_routes

def init_routes(app, login_manager, mail, socketio):
    init_auth_routes(app, login_manager, mail)
    init_project_routes(app, socketio)
    init_file_routes(app)
    init_parasha_routes(app)
    init_session_routes(app, socketio)
    init_analysis_routes(app)

