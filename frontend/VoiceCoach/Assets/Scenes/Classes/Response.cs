using System.Collections.Generic;

namespace Assets.Scenes.Classes
{
    public class Response
    {
        public string result;
        public int statusCode;
        public string error;
        public string text;

        public Response()
        {
            // Constructor
        }

        // Builder class for Response
        public class ResponseBuilder
        {
            private Response response;

            public ResponseBuilder()
            {
                response = new Response();
            }

            public ResponseBuilder WithResult(string result)
            {
                response.result = result;
                return this;
            }

            public ResponseBuilder WithStatusCode(int statusCode)
            {
                response.statusCode = statusCode;
                return this;
            }

            public ResponseBuilder WithError(string error)
            {
                response.error = error;
                return this;
            }

            public ResponseBuilder WithData(string text)
            {
                response.text = text;
                return this;
            }

            public Response Build()
            {
                return response;
            }
        }
    }
}
