import re
import Levenshtein
import sys
import io

def hebrew_soundex(word):
    word = re.sub(r'[^\u05D0-\u05EA]', '', word)  # Only keep Hebrew letters

    soundex_mapping = {
        'א': '0', 'ה': '0', 'ח': '0', 'ע': '0',  # Silence letters
        'ב': '1', 'ו': '1', 'פ': '1', 'ף': '1', 'מ': '1', 'ם': '1',
        'ג': '2', 'ק': '2',
        'ד': '3', 'ט': '3', 'ת': '3',
        'ז': '4', 'ס': '4', 'צ': '4', 'ץ': '4',
        'י': '5', 'נ': '5', 'ן': '5',
        'כ': '6', 'ך': '6', 'ל': '6', 'ר': '6',
        'ש': '7', 'שׂ': '7'
    }

    if not word:
        return ''

    soundex_code = word[0]

    for char in word[1:]:
        if char in soundex_mapping:
            code = soundex_mapping[char]
            if code != soundex_code[-1]:
                soundex_code += code

    soundex_code = soundex_code[:4].ljust(4, '0')
    return soundex_code

def soundex_similarity(word1, word2, max_diff=1):
    soundex1 = hebrew_soundex(word1)
    soundex2 = hebrew_soundex(word2)
    
    # Allow for some differences in the soundex codes
    differences = sum(1 for a, b in zip(soundex1, soundex2) if a != b)
    return differences <= max_diff

def levenshtein_distance(word1, word2):
    return Levenshtein.distance(word1, word2)

def is_close_enough(recognized_word, text_word, max_distance=2, max_soundex_diff=1):
    if soundex_similarity(recognized_word, text_word, max_soundex_diff):
        distance = levenshtein_distance(recognized_word, text_word)
        if distance <= max_distance:
            return True, distance
    # Check if one word is a substring of the other
    if recognized_word in text_word or text_word in recognized_word:
        return True, max_distance
    return False, None

def find_best_match(word, cleaned_words, dirty_words, start_index, max_distance=2, max_soundex_diff=1):
    for i in range(start_index, len(cleaned_words)):
        if is_close_enough(word, cleaned_words[i], max_distance, max_soundex_diff)[0]:
            return dirty_words[i], i + 1  # Return the matched word and the next start index
    
    return word, start_index  # If no match is found, return the original word and the current start index

def fixTeamimWithWords(teamim, cleanTxt, dirtyTxt):
    cleaned_words = cleanTxt.split()
    dirty_words = dirtyTxt.split()
    len_teamim = len(teamim)
    start_index = 0
    
    for i, place in enumerate(teamim):
        place['text'], start_index = find_best_match(place['text'], cleaned_words, dirty_words, start_index)
    
    return teamim

teamim = [
    {"end": 4.41, "exp": "תנסה להאריך את הטעם, קצר מדי", "review": "BAD", "score": 0.0, "start": 3.85, "text": "בראכית"},
    {"end": 1.37, "exp": "תנסה לקצר את הטעם, ארוך מדי", "review": "BAD", "score": 0.0, "start": 0.11, "text": "ברא"},
    {"end": 3.13, "exp": "תנסה להאריך את הטעם, קצר מדי", "review": "BAD", "score": 0.0, "start": 2.83, "text": "אלוהים"},
    {"end": 10.85, "exp": "תנסה להאריך את הטעם, קצר מדי", "review": "BAD", "score": 0.0, "start": 10.63, "text": "השמיים"},
    {"end": 10.13, "exp": "תנסה להאריך את הטעם, קצר מדי", "review": "BAD", "score": 0.0, "start": 9.85, "text": "ואת"},
    {"end": 11.15, "exp": "תנסה להאריך את הטעם, קצר מדי", "review": "BAD", "score": 0.0, "start": 10.15, "text": "הארף"}
]

cleanTxt = "בראשית ברא אלוהים את השמיים ואת הארץ"
dirtyTxt = "בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ"

fixed_teamim = fixTeamimWithWords(teamim, cleanTxt, dirtyTxt)

# Write to a file
with open('output.txt', 'w', encoding='utf-8') as f:
    f.write(str(fixed_teamim))

print("Output written to 'output.txt'")
