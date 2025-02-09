import pandas as pd
import json
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from collections import Counter
import string
import re

# Ensure required NLTK resources are downloaded
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('punkt_tab')

# Custom stopwords specific to cricket commentary
custom_stopwords = {
    'runs', 'run', 'bowler', 'batsman', 'batting', 'bowling',
    'wicket', 'innings', 'match', 'player', 'team', 'score',
    'field', 'fielder', 'boundary',
    'comes', 'goes', 'gets', 'got', 'taking', 'taken', 'makes', 'made',
    'going', 'comes', 'well', 'right', 'left',
    'great', 'nice', 'now', 'just', 'one', 'two', 'three',
    'four', 'six', 'single', 'double'
}

# Load JSON file
file_path = "commentarydata.json"  # Replace with your actual file path
with open(file_path, 'r') as file:
    data = json.load(file)

# Normalize both innings
inning1 = pd.json_normalize(data, record_path=['commentary_innings1'])
inning2 = pd.json_normalize(data, record_path=['commentary_innings2'])

# Add a column to distinguish between innings
inning1['inning'] = 1
inning2['inning'] = 2

# Combine both innings into a single DataFrame
commentary = pd.concat([inning1, inning2], ignore_index=True)

# Combine NLTK stopwords with custom stopwords (excluding 'off')
stop_words = set(stopwords.words('english')) | custom_stopwords - {'off'}

def remove_first_phrase(text):
    """Remove the first phrase up to the first comma"""
    parts = text.split(',', 1)
    if len(parts) > 1:
        return parts[1].strip()
    return text

# Function to preprocess and tokenize commText
def preprocess_and_tokenize(text, n=1):
    # Remove the first phrase (bowler to batsman)
    text = remove_first_phrase(text)
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    
    # Remove numeric numbers (both standalone and within words)
    text = re.sub(r'\b\d+\b|\d+', '', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    # Tokenize the text
    tokens = word_tokenize(text)
    
    # Remove stopwords and empty strings
    tokens = [word for word in tokens if word not in stop_words and word.strip()]
    
    # Generate n-grams
    if n > 1:
        ngrams = nltk.ngrams(tokens, n)
        return list(ngrams)
    return tokens

# Count word or n-gram frequency
def count_word_frequency(df, n=1):
    all_tokens = []
    
    for text in df['commText']:
        tokens = preprocess_and_tokenize(text, n)
        all_tokens.extend(tokens)
    
    return Counter(all_tokens)

# Count frequencies for unigrams and bigrams
unigram_frequency = count_word_frequency(commentary, n=1)
bigram_frequency = count_word_frequency(commentary, n=2)

# Convert Counter to DataFrame for better readability
unigram_df = pd.DataFrame(unigram_frequency.items(), columns=['Word', 'Count']).sort_values(by='Count', ascending=False)
bigram_df = pd.DataFrame([(' '.join(gram), count) for gram, count in bigram_frequency.items()], 
                         columns=['Bigram', 'Count']).sort_values(by='Count', ascending=False)

# Output results
# print("Top 10 Unigrams:")
# print(unigram_df.head(40))
print("\nTop 10 Bigrams:")
print(bigram_df.head(50))

# Optional: Print a few example processed comments to verify the first phrase removal
# print("\nExample processed comments:")
# for text in commentary['commText'][:3]:
#     print("Original:", text)
#     print("Processed:", remove_first_phrase(text))
#     print()