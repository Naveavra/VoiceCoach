using System;
namespace myToken {
    [System.Serializable]
    public class TokenResponse {
    
        public string token;
        public string user_id;

        public TokenResponse(string token, string user_id) {
            this.token = token;
            this.user_id = user_id;
        }
    }
}
namespace myError {
    [System.Serializable]
    public class ErrorResponse {
        public string error;

        public ErrorResponse(string error) {
            this.error = error;
        }
    }
}

namespace myProject {




    [System.Serializable]
    public class ProjectResponse {
        public string description;
        public int id;
        public string name;
        public int user_id;

        public ProjectResponse(string description,int id, string name, int user_id ) {
            this.description = description;
            this.id = id;
            this.name = name;
            this.user_id = user_id;
        }
    }

    [System.Serializable]
    public class ProjectWrapper {
        public ProjectResponse[] projects;
    }
}