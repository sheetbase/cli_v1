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

export function buildKeyValueFromParams(params: any[]): {[key: string]: any} {
    const output: any = {};
    params.forEach(item => {
        const multipleSplit = item.split('|');
        multipleSplit.forEach(single => {
            const singleSplit = single.trim().split('=');
            if(singleSplit[1]) {
                output[singleSplit[0].trim()] = makeupValues(singleSplit[1].trim());
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

export function makeupValues(value: any) {
    if ((value + '').toLowerCase() === 'true') {
        // boolean TRUE
        value = true;
    }
    else if ((value + '').toLowerCase() === 'false') {
        // boolean FALSE
        value = false;
    }
    else if (!isNaN(value)) {
        // number
        if (Number(value) % 1 === 0) {
            // tslint:disable-next-line:ban
            value = parseInt(value, 2);
        }
        if (Number(value) % 1 !== 0) {
            // tslint:disable-next-line:ban
            value = parseFloat(value);
        }
    }
    else {
        // JSON
        try {
            value = JSON.parse(value);
        } catch (e) {
            // continue
        }
    }
    return value;
}
