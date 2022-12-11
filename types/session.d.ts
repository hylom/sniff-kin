import * as http from 'node:http';
import * as stream from 'node:stream';

type RequestCondition = (clientRequest: http.ClientRequest) => boolean;
type RequestProcessor = (serverRequest: http.ClientRequest) => void;
type ResponseCondition = (clientRequest: http.ClientRequest,
                          serverResponse: http.ServerResponse) => boolean;
type ResponseProcessor = (clientRequest: http.ClientRequest,
                          serverResponse: http.ServerResponse) => void;

interface RequestFilter {
    condition: RequestCondition | null;
    requestProcessor: RequestProcessor | null;
    bodyFilter: stream.Transform | null;
}

interface ResponseFilter {
    condition: ResponseCondition | null;
    responseProcessor: ResponseProcessor | null;
    bodyFilter: stream.Transform | null;
}

interface Session {
    addRequestFilter(filterOrCondition: RequestFilter | RequestCondition,
                     requestProcessor: RequestProcessor | null,
                     bodyFilter: stream.Transform | null);
    addResponseFilter(filterOrCondition: ResponseFilter | ResponseCondition,
                      responseProcessor: ResponseProcessor | null,
                      bodyFilter: stream.Transform | null);
}

