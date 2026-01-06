function getSuggestion(input) {
    let letterSuggestion = [];
    letterSuggestion.push({key: 'a', value: ['á']});
    letterSuggestion.push({key: 'e', value: ['é','ě']});
    letterSuggestion.push({key: 'u', value: ['ú','ů']});
    letterSuggestion.push({key: 'i', value: ['í']});
    letterSuggestion.push({key: 'y', value: ['ý']});
    letterSuggestion.push({key: 'c', value: ['č']});
    letterSuggestion.push({key: 's', value: ['š']});
    letterSuggestion.push({key: 'r', value: ['ř']});
    letterSuggestion.push({key: 'z', value: ['ž']});

    let result = [];
    result.push(input);
    letterSuggestion.forEach(ls => {
        ls.value.forEach(v => {
            var replaced = input.replace(ls.key, v);
            result.push(replaced);
        });
    });
    return result.reduce((acc, obj) => {
        if (!acc.some(o => obj === o)) {
            acc.push(obj);
        }
        return acc;
    }, []);
}

function combinations(arr, min = 1, max) {
    const combination = (arr, depth) => {
        if (depth === 1) {
            return arr;
        } else {
            const result = combination(arr, depth - 1).flatMap((val) =>
                arr.map((char) => val + char)
            );
            return arr.concat(result);
        }
    };
    return combination(arr, max).filter((val) => val.length >= min);
};

function translitRussianText(input) {
    let letterSuggestion = [];
    letterSuggestion.push({key: 'а', value: ['a', 'á']});
    letterSuggestion.push({key: 'б', value: ['b']});
    letterSuggestion.push({key: 'в', value: ['v']});
    letterSuggestion.push({key: 'г', value: ['g', 'h']});
    letterSuggestion.push({key: 'д', value: ['d']});
    letterSuggestion.push({key: 'е', value: ['e', 'é', 'ě']});
    letterSuggestion.push({key: 'ё', value: ['e', 'é', 'ě']});
    letterSuggestion.push({key: 'є', value: ['e', 'é', 'ě']});
    letterSuggestion.push({key: 'ж', value: ['ž']});
    letterSuggestion.push({key: 'з', value: ['z']});
    letterSuggestion.push({key: 'и', value: ['i', 'í', 'y', 'ý']});
    letterSuggestion.push({key: 'і', value: ['i', 'í']});
    letterSuggestion.push({key: 'ї', value: ['i', 'í']});
    letterSuggestion.push({key: 'й', value: ['i', 'í', 'y', 'ý']});
    letterSuggestion.push({key: 'к', value: ['k']});
    letterSuggestion.push({key: 'л', value: ['l']});
    letterSuggestion.push({key: 'м', value: ['m']});
    letterSuggestion.push({key: 'н', value: ['n', 'ň']});
    letterSuggestion.push({key: 'о', value: ['o']});
    letterSuggestion.push({key: 'п', value: ['p']});
    letterSuggestion.push({key: 'р', value: ['r', 'ř']});
    letterSuggestion.push({key: 'с', value: ['c', 's']});
    letterSuggestion.push({key: 'т', value: ['t']});
    letterSuggestion.push({key: 'у', value: ['u', 'ú', 'ů']});
    letterSuggestion.push({key: 'ф', value: ['f']});
    letterSuggestion.push({key: 'х', value: ['ch', 'h']});
    letterSuggestion.push({key: 'ц', value: ['c']});
    letterSuggestion.push({key: 'ч', value: ['č']});
    letterSuggestion.push({key: 'ш', value: ['š']});
    letterSuggestion.push({key: 'щ', value: ['šč']});
    letterSuggestion.push({key: 'ъ', value: ['']});
    letterSuggestion.push({key: 'ы', value: ['y', 'ý']});
    letterSuggestion.push({key: 'ь', value: ['']});
    letterSuggestion.push({key: 'э', value: ['e', 'é', 'ě']});
    letterSuggestion.push({key: 'ю', value: ['u', 'ú', 'ů']});
    letterSuggestion.push({key: 'я', value: ['ia', 'ía', 'ya', 'ýa']});

    let result = [];
    for(var i = 0; i < input.length; i++) {
        var lsv = letterSuggestion.find(k => k.key == input[i])?.value;
        result.push.apply(result, lsv);
    }
    var combs = combinations(result, input.length, input.length);

    let final = [];
    var lsv = letterSuggestion.find(k => k.key == input[0])?.value;
    lsv.forEach(l => {
        final.push.apply(final, combs.filter(c => c.substring(0).startsWith(l)));
    });
    if (input.length > 1) {
        for(var i = 1; i < input.length; i++) {
            var lsv = letterSuggestion.find(k => k.key == input[i])?.value;
            var toRemove = final.filter(item => !lsv.includes(item.charAt(i)));
            toRemove.forEach(tr => {
                final.splice(final.indexOf(tr), 1);
            });
        }
    }

    return final;
}

module.exports = { getSuggestion, translitRussianText }