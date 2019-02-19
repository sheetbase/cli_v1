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
    configs: SheetbasePrerender,
) {
    const { type, rewriteFields = {}, defaultValues = {} } = configs;

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
            ['<meta name="twitter:title" content="', '" />'], // twitter
            ['<meta property="og:title" content="', '" />'], // facebook
        ]);
    }
    if (!!url) {
        html = replaceBetween(html, url, [
            ['<meta property="og:url" content="', '" />'], // facebook
        ]);
    }
    if (!!description) {
        html = replaceBetween(html, description, [
            ['<meta name="description" content="', '" />'],
            ['<meta itemprop="description" content="', '" />'], // google
            ['<meta name="twitter:description" content="', '" />'], // twitter
            ['<meta property="og:description" content="', '" />'], // facebook
        ]);
    }
    if (!!image) {
        html = replaceBetween(html, image, [
            ['<meta name="image" content="', '" />'],
            ['<meta itemprop="image" content="', '" />'], // google
            ['<meta name="twitter:image" content="', '" />'], // twitter
            ['<meta property="og:image" content="', '" />'], // facebook
        ]);
    }

    // custom type
    if (type === 'article') {
        // author
        let author: string | {} = item[rewriteFields['author'] || 'author'] ||
            defaultValues['author'] || 'Sheetbase';
        author = (author instanceof Object) ? author[Object.keys(author).pop()] : author;
        // publisher
        const publisher: string = item[rewriteFields['publisher'] || 'publisher'] ||
            defaultValues['publisher'] || 'Sheetbase';
        // published
        let published: string = item[rewriteFields['published'] || 'published'] ||
            defaultValues['published'];
        published = new Date(published || new Date()).toISOString();
        // modified
        let modified: string = item[rewriteFields['modified'] || 'modified'] ||
            defaultValues['modified'] || published;
        modified = new Date(modified || new Date()).toISOString();
        // section
        let section: string | {} = item[rewriteFields['section'] || 'section'] ||
            defaultValues['section'] || 'Sheetbase';
        section = (section instanceof Object) ? section[Object.keys(section).pop()] : section;
        // tag
        const _tag: string | {} = item[rewriteFields['tag'] || 'tag'] ||
            defaultValues['tag'] || 'sheetbase blog app';
        let tag = '';
        if (_tag instanceof Object) {
            for (const key of Object.keys(_tag)) { tag += _tag[key] + ' '; }
            tag = tag.trim();
        } else {
            tag = _tag as string;
        }
        // change type
        html = replaceBetween(html, 'article', '<meta property="og:type" content="', '" />');
        // add tags
        html = html.replace(
            '</head>',
  `

  <!-- Facebook: Article -->
  <meta property="article:author" content="${author}" />
  <meta property="article:publisher" content="${publisher}" />
  <meta property="article:published_time" content="${published}" />
  <meta property="article:modified_time" content="${modified}" />
  <meta property="article:section" content="${section}" />
  <meta property="article:tag" content="${tag}" />

  </head>`,
        );
    } else if (type === 'product') {
        // availability
        const availability: string = item[rewriteFields['availability'] || 'availability'] ||
            defaultValues['availability'] || 'instock';
        // brand
        const brand: string = item[rewriteFields['brand'] || 'brand'] ||
            defaultValues['brand'] || 'Sheetbase';
        // category
        let category: string | {} = item[rewriteFields['category'] || 'category'] ||
            defaultValues['category'] || 'Sheetbase';
        category = (category instanceof Object) ? category[Object.keys(category).pop()] : category;
        // price
        const price: string = item[rewriteFields['price'] || 'price'] ||
            defaultValues['price'] || 0;
        // currency
        const currency: string = item[rewriteFields['currency'] || 'currency'] ||
            defaultValues['currency'] || 'USD';
        // change type
        html = replaceBetween(html, 'product', '<meta property="og:type" content="', '" />');
        // add tags
        html = html.replace(
            '</head>',
  `

  <!-- Facebook: Product -->
  <meta property="product:availability" content="${availability}" />
  <meta property="product:brand" content="${brand}" />
  <meta property="product:category" content="${category}" />
  <meta property="product:price:amount" content="${price}" />
  <meta property="product:price:currency" content="${currency}" />

  </head>`,
        );
    } else if (type === 'image') {

    } else if (type === 'video') {

    }

    return html;
}