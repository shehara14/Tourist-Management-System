import sys
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

def load_artifacts():
    """Load all required ML artifacts"""
    artifacts = {
        'model': joblib.load('ml/trained_model/recommender.joblib'),
        'mlb_place_type': joblib.load('ml/trained_model/mlb_place_type.joblib'),
        'mlb_hobby': joblib.load('ml/trained_model/mlb_hobby.joblib'),
        'mlb_health_issues': joblib.load('ml/trained_model/mlb_health_issues.joblib'),
        'feature_columns': json.load(open('ml/trained_model/feature_columns.json'))
    }
    return artifacts

def preprocess_input(input_data, artifacts):
    """Convert input data to model-ready format"""
    # Create base DataFrame
    df = pd.DataFrame({
        'age': [input_data['preferences']['age']],
        'gender': [input_data['preferences']['gender']],
        'climate': [input_data['preferences']['climate']]
    })
    
    # Multi-label features
    mlb_features = {
        'place_type': input_data['preferences']['placeType'],
        'hobby': input_data['preferences']['hobby'],
        'health_issues': input_data['preferences']['health_issues']
    }
    
    # Apply multi-label binarizers
    for feature, values in mlb_features.items():
        mlb = artifacts[f'mlb_{feature}']
        encoded = mlb.transform([values])
        encoded_df = pd.DataFrame(encoded, 
                                columns=[f"{feature}_{v}" for v in mlb.classes_])
        df = pd.concat([df, encoded_df], axis=1)
    
    # Get dummies for categoricals
    df = pd.get_dummies(df)
    
    # Ensure all training columns exist
    for col in artifacts['feature_columns']:
        if col not in df.columns:
            df[col] = 0
    
    # Reorder columns to match training
    df = df[artifacts['feature_columns']]
    
    return df

def predict_places(input_data, artifacts):
    """Generate predictions for all places"""
    results = []
    
    # Preprocess user preferences once
    user_features = preprocess_input(input_data, artifacts)
    
    for place in input_data['places']:
        try:
            # Prepare place features
            place_features = {
                'age': input_data['preferences']['age'],
                'gender': input_data['preferences']['gender'],
                'climate': place['features']['climate'][0],
                'place_type': place['features']['place_type'],
                'hobby': place['features']['hobby'],
                'health_issues': place['features']['health_issues']
            }
            
            # Create input DataFrame for this place
            place_input = input_data.copy()
            place_input['preferences'].update(place_features)
            place_df = preprocess_input(place_input, artifacts)
            
            # Get prediction probabilities
            probas = artifacts['model'].predict_proba(place_df)
            class_idx = list(artifacts['model'].classes_).index(place['name'])
            score = probas[0][class_idx] * 100  # Convert to percentage
            
            results.append({
                'placeId': place['id'],
                'score': round(float(score), 2),
                'matchedFeatures': get_matched_features(input_data['preferences'], place['features'])
            })
            
        except Exception as e:
            print(f"Error processing place {place['id']}: {str(e)}")
            results.append({
                'placeId': place['id'],
                'score': 0,
                'matchedFeatures': []
            })
    
    return sorted(results, key=lambda x: x['score'], reverse=True)

def get_matched_features(user_prefs, place_features):
    """Identify which features contributed to the recommendation"""
    matches = []
    
    # Age compatibility
    age_min = place_features.get('age_min', 0)
    age_max = place_features.get('age_max', 100)
    if age_min <= user_prefs['age'] <= age_max:
        matches.append(f"Age {user_prefs['age']} fits range {age_min}-{age_max}")
    
    # Place type matches
    place_type_matches = set(user_prefs['placeType']) & set(place_features['place_type'])
    if place_type_matches:
        matches.append(f"Place types: {', '.join(place_type_matches)}")
    
    # Hobby matches
    hobby_matches = set(user_prefs['hobby']) & set(place_features['hobby'])
    if hobby_matches:
        matches.append(f"Activities: {', '.join(hobby_matches)}")
    
    # Climate match
    if user_prefs['climate'] in place_features['climate']:
        matches.append(f"Climate: {user_prefs['climate']}")
    
    # Health compatibility
    health_conflicts = set(user_prefs['health_issues']) & set(place_features['health_issues'])
    if not health_conflicts:
        matches.append("No health restrictions")
    
    return matches

def main():
    try:
        # Load input file path from command line
        input_file = sys.argv[1]
        
        print("Loading ML artifacts...")
        artifacts = load_artifacts()
        
        print("Loading input data...")
        with open(input_file) as f:
            input_data = json.load(f)
        
        print("Generating recommendations...")
        results = predict_places(input_data, artifacts)
        
        # Print results as JSON (will be captured by Node.js)
        print(json.dumps(results))
        
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()