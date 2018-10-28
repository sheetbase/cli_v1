export const DEPLOY_PATH = 'backend/dist';
export const INIT_CONTENT = [
    {
        name: 'appsscript',
        type: 'JSON',
        source: `
        {
            "timeZone": "Asia/Bangkok",
            "webapp": {
              "access": "ANYONE_ANONYMOUS",
              "executeAs": "USER_DEPLOYING"
            },
            "exceptionLogging": "STACKDRIVER"
        }
        `,
    },
    {
        name: 'index',
        type: 'SERVER_JS',
        source: `
        function doGet() {
            return HtmlService.createHtmlOutput('Init webapp succeed.');
        }
        `,
    },
];
