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

function translitRussianText(input) {
    let letterSuggestion = [];
    letterSuggestion.push({key: 'а', value: 'a'});
    letterSuggestion.push({key: 'б', value: 'b'});
    letterSuggestion.push({key: 'в', value: 'v'});
    letterSuggestion.push({key: 'г', value: 'g'});
    letterSuggestion.push({key: 'д', value: 'd'});
    letterSuggestion.push({key: 'е', value: 'e'});
    letterSuggestion.push({key: 'ё', value: 'e'});
    letterSuggestion.push({key: 'ж', value: 'ž'});
    letterSuggestion.push({key: 'з', value: 'z'});
    letterSuggestion.push({key: 'и', value: 'i'});
    letterSuggestion.push({key: 'й', value: 'i'});
    letterSuggestion.push({key: 'к', value: 'k'});
    letterSuggestion.push({key: 'л', value: 'l'});
    letterSuggestion.push({key: 'м', value: 'm'});
    letterSuggestion.push({key: 'н', value: 'n'});
    letterSuggestion.push({key: 'о', value: 'o'});
    letterSuggestion.push({key: 'п', value: 'p'});
    letterSuggestion.push({key: 'р', value: 'r'});
    letterSuggestion.push({key: 'с', value: 's'});
    letterSuggestion.push({key: 'т', value: 't'});
    letterSuggestion.push({key: 'у', value: 'u'});
    letterSuggestion.push({key: 'ф', value: 'f'});
    letterSuggestion.push({key: 'х', value: 'ch'});
    letterSuggestion.push({key: 'ц', value: 'c'});
    letterSuggestion.push({key: 'ч', value: 'č'});
    letterSuggestion.push({key: 'ш', value: 'š'});
    letterSuggestion.push({key: 'щ', value: 'šč'});
    letterSuggestion.push({key: 'ъ', value: ''});
    letterSuggestion.push({key: 'ы', value: 'y'});
    letterSuggestion.push({key: 'ь', value: ''});
    letterSuggestion.push({key: 'э', value: 'e'});
    letterSuggestion.push({key: 'ю', value: 'u'});
    letterSuggestion.push({key: 'я', value: 'ya'});

    let result = [];
    for (var i = 0; i < input.length; i++) {
        result.push(letterSuggestion.find(x => x.key == input[i])?.value ?? '');
    }
    return result.join('');
}

function translitUkrainianText(input) { 
    let letterSuggestion = [];
    letterSuggestion.push({key: 'а', value: 'a'});
    letterSuggestion.push({key: 'б', value: 'b'});
    letterSuggestion.push({key: 'в', value: 'v'});
    letterSuggestion.push({key: 'г', value: 'g'});
    letterSuggestion.push({key: 'д', value: 'd'});
    letterSuggestion.push({key: 'е', value: 'e'});
    letterSuggestion.push({key: 'є', value: 'e'});
    letterSuggestion.push({key: 'ж', value: 'ž'});
    letterSuggestion.push({key: 'з', value: 'z'});
    letterSuggestion.push({key: 'и', value: 'i'});
    letterSuggestion.push({key: 'і', value: 'i'});
    letterSuggestion.push({key: 'ї', value: 'i'});
    letterSuggestion.push({key: 'к', value: 'k'});
    letterSuggestion.push({key: 'л', value: 'l'});
    letterSuggestion.push({key: 'м', value: 'm'});
    letterSuggestion.push({key: 'н', value: 'n'});
    letterSuggestion.push({key: 'о', value: 'o'});
    letterSuggestion.push({key: 'п', value: 'p'});
    letterSuggestion.push({key: 'р', value: 'r'});
    letterSuggestion.push({key: 'с', value: 's'});
    letterSuggestion.push({key: 'т', value: 't'});
    letterSuggestion.push({key: 'у', value: 'u'});
    letterSuggestion.push({key: 'ф', value: 'f'});
    letterSuggestion.push({key: 'х', value: 'ch'});
    letterSuggestion.push({key: 'ц', value: 'c'});
    letterSuggestion.push({key: 'ч', value: 'č'});
    letterSuggestion.push({key: 'ш', value: 'š'});
    letterSuggestion.push({key: 'щ', value: 'šč'});
    letterSuggestion.push({key: 'ъ', value: ''});
    letterSuggestion.push({key: 'ь', value: ''});
    letterSuggestion.push({key: 'э', value: 'e'});
    letterSuggestion.push({key: 'ю', value: 'u'});
    letterSuggestion.push({key: 'я', value: 'ia'});

    let result = [];
    for (var i = 0; i < input.length; i++) {
        result.push(letterSuggestion.find(x => x.key == input[i])?.value ?? '');
    }
    return result.join('');
}

module.exports = { getSuggestion, translitRussianText, translitUkrainianText }