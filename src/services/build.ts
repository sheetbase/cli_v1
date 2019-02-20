import { SheetbasePrerender } from './project';
import { replaceBetween  } from './utils';

export function github404HtmlContent(repo: string, title = 'Sheetbase') {
    return (
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <script>sessionStorage.redirect = location.href;</script>
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
    prerenderConfigs: SheetbasePrerender,
) {
    const { rewriteFields = {}, defaultValues = {} } = prerenderConfigs;

    // prepare data
    const title: string = item[rewriteFields['title'] || 'title'] ||
        defaultValues['title'];
    const description: string = item[rewriteFields['description'] || 'description'] ||
        defaultValues['description'];
    const image: string = item[rewriteFields['image'] || 'image'] ||
        defaultValues['image'];
    let content: string = item[rewriteFields['content'] || 'content'] ||
        defaultValues['content'] || description || title;
    content = content.substr(0, 3) === '<p>' || content.substr(0, -4) === '</p>' ?
        content : '<p>' + content + '</p>';

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
            ['<title>', '</title>'],
            ['<meta itemprop="name" content="', '" />'], // google
            ['<meta property="og:title" content="', '" />'], // facebook & twitter
        ]);
    }
    if (!!url) {
        html = replaceBetween(html, url, [
            ['<link rel="canonical" href="', '" />'],
            ['<meta property="og:url" content="', '" />'], // facebook & twitter
        ]);
    }
    if (!!description) {
        html = replaceBetween(html, description, [
            ['<meta name="description" content="', '" />'],
            ['<meta itemprop="description" content="', '" />'], // google
            ['<meta property="og:description" content="', '" />'], // facebook & twitter
        ]);
    }
    if (!!image) {
        html = replaceBetween(html, image, [
            ['<meta itemprop="image" content="', '" />'], // google
            ['<meta property="og:image" content="', '" />'], // facebook & twitter
        ]);
    }

    return html;
}