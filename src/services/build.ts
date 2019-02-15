import { SheetbasePrerender } from './project';
import { replaceBetween  } from './utils';

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
        html = replaceBetween(html, base, '<base href="', '" />');
    }
    return html;
}

export function prerenderer(
    html: string,
    item: any,
    url: string,
    configs: SheetbasePrerender,
) {
    const { fields } = configs;
    // prepare data
    const title: string = item[fields['title'] || 'title'];
    const description: string = item[fields['description'] || 'description'];
    const image: string = item[fields['image'] || 'image'];
    let content: string = item[fields['content'] || 'content'] || title;
    content = content.substr(0, 3) === '<p>' || content.substr(0, -4) === '</p>' ?
        content : '<p>' + content + '</p>';

    // replace title
    html = replaceBetween(html, title, '<title>', '</title>');

    // add content
    const article = (
    `<article class="sheetbase-prerender-content">
        <h1>${title}</h1>
        ${ !!description ? '<p><strong>' + description + '</strong></p>' : '' }
        ${ !!image ? '<p><img src="' + image + '" alt="' + title + '" /></p>' : '' }
        ${content}
    </article>`
    );
    if (
        html.indexOf('<app-root>') > -1 &&
        html.indexOf('</app-root>') > -1
    ) { // Angular
        html = html.replace('</app-root>', article + '</app-root>');
    } else {
        html = html.replace('</body>', article + '</body>');
    }

    // modify meta data
    if (!!title) {
        html = replaceBetween(html, title, [
            ['<meta property="og:title" content="', '">'], // facebook
            ['<meta itemprop="name" content="', '">'], // google
            ['<meta name="twitter:title" content="', '">'], // twitter
        ]);
    }
    if (!!url) {
        html = replaceBetween(html, url, [
            ['<meta property="og:url" content="', '">'], // facebook
            ['<meta name="twitter:url" content="', '">'], // twitter
        ]);
    }
    if (!!description) {
        html = replaceBetween(html, description, [
            ['<meta property="og:description" content="', '">'], // facebook
            ['<meta itemprop="description" content="', '">'], // google
            ['<meta name="twitter:description" content="', '">'], // twitter
        ]);
    }
    if (!!image) {
        html = replaceBetween(html, image, [
            ['<meta property="og:image" content="', '">'], // facebook
            ['<meta itemprop="image" content="', '">'], // google
            ['<meta name="twitter:image" content="', '">'], // twitter
        ]);
    }
    return html;
}