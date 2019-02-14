export function github404HtmlContent(repo: string, title = 'Sheetbase') {
    return (
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <script>
    sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/${repo}'"></meta>
</head>
<body>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</body>
</html>`
    );
}

export function githubIndexHtmlSPAGenerator(html: string, base?: string) {
    //SPA hack
    html = html.replace(
    '<head>',
    `<head>

    <!-- Github Pages hack to allow SPA refresh without receiving 404. -->
    <script>
        (function () {
            var redirect = sessionStorage.redirect;
            delete sessionStorage.redirect;
            if (redirect && redirect != location.href) {
                history.replaceState(null, null, redirect);
            }
        })();
    </script>
    <!-- /Github Pages hack. -->
    `,
    );
    // change base
    if (!!base) {
        html = html.replace(/\<base href=\"(.*)\" \/\>/g, `<base href="${base}" />`);
    }
    return html;
}

export function prerenderer(html: string, item: any) {
    return 'xxx';
}