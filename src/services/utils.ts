export function buildValidFileName(name: string) {
  return name.replace(/\ /g, '-')
  .replace(/\</g, '-')
  .replace(/\,/g, '-')
  .replace(/\>/g, '-')
  .replace(/\./g, '-')
  .replace(/\?/g, '-')
  .replace(/\//g, '-')
  .replace(/\:/g, '-')
  .replace(/\;/g, '-')
  .replace(/\"/g, '-')
  .replace(/\'/g, '-')
  .replace(/\{/g, '-')
  .replace(/\[/g, '-')
  .replace(/\}/g, '-')
  .replace(/\]/g, '-')
  .replace(/\|/g, '-')
  .replace(/\\/g, '-')
  .replace(/\`/g, '-')
  .replace(/\~/g, '-')
  .replace(/\!/g, '-')
  .replace(/\@/g, '-')
  .replace(/\#/g, '-')
  .replace(/\$/g, '-')
  .replace(/\%/g, '-')
  .replace(/\^/g, '-')
  .replace(/\&/g, '-')
  .replace(/\*/g, '-')
  .replace(/\(/g, '-')
  .replace(/\)/g, '-')
  .replace(/\+/g, '-')
  .replace(/\=/g, '-');
}

export function buildKeyValueFromParams(params: any[]): { [key: string]: any } {
  const output: any = {};
  params.forEach(item => {
    const multipleSplit = item.split('|');
    multipleSplit.forEach(single => {
      const singleSplit = single.trim().split('=');
      if (singleSplit[1]) {
        output[singleSplit[0].trim()] = parseValue(singleSplit[1].trim());
      }
    });
  });
  return output;
}

export function formatDate(date: Date): string {
  const monthNames = [
    'January', 'February', 'March',
    'April', 'May', 'June', 'July',
    'August', 'September', 'October',
    'November', 'December',
  ];
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  return monthNames[monthIndex] + ' ' + day + ', ' + year;
}

export function parseValue(value: any) {
  if ((value + '').toLowerCase() === 'true') { // TRUE
    value = true;
  } else if ((value + '').toLowerCase() === 'false') { // FALSE
    value = false;
  } else if (!isNaN(value)) { // number
    value = Number(value);
  } else { // JSON
    try {
      value = JSON.parse(value);
    } catch (e) {
      /* invalid json, keep value as is */
    }
  }
  return value;
}

export function replaceBetween(
  content: string,
  replaceWith: string,
  starts: string | string[][] = [],
  ends?: string,
) {
  // process data
  if (typeof starts === 'string') {
    if (!!ends) {
      starts = [[starts, ends]];
    } else {
      starts = [];
    }
  }
  // replace
  for (let i = 0; i < starts.length; i++) {
    const [start, end] = starts[i] || [] as any;
    if (!!start && !!end) {
      const reg = new RegExp(start + '(.*)' + end, 'g');
      content = content.replace(reg, start + replaceWith + end);
    }
  }
  return content;
}

export function isHostSubfolder(url: string) {
  return url.split('/').filter(Boolean).length > 2;
}

export function isUrl(str: string) {
  return str.indexOf('http') !== -1 && str.indexOf('://') !== -1;
}