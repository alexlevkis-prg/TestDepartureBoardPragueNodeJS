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

module.exports = { getSuggestion }