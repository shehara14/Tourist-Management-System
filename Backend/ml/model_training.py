import pandas as pd
import numpy as np
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.preprocessing import MultiLabelBinarizer
import joblib
import json
from collections import defaultdict

def ensure_dir_exists(path):
    """Ensure directory exists, create if it doesn't"""
    os.makedirs(path, exist_ok=True)

def load_tour_packages_data():
    """Load tour packages data from JSON file"""
    with open('test.tourpackages33.json', 'r') as f:
        data = json.load(f)
    return data

def extract_place_info(tour_packages):
    """Extract place information from tour packages data"""
    place_info = {}
    
    for package in tour_packages:
        for place in package['places']:
            name = place['name']
            if name not in place_info:
                place_info[name] = {
                    'types': place['placeType'],
                    'best_for': place['suitableFor']['hobbies'],
                    'climate': place['suitableFor']['climate'][0] if place['suitableFor']['climate'] else 'Tropical',
                    'age_range': (place['suitableFor']['ageRange']['min'], place['suitableFor']['ageRange']['max']),
                    'health_warnings': place['suitableFor']['healthConsiderations']['notRecommendedFor']
                }
    
    return place_info

def generate_synthetic_data():
    """Generate synthetic data using real place information from JSON"""
    np.random.seed(42)
    num_samples = 20000
    
    # Load real place data from JSON
    tour_packages = load_tour_packages_data()
    place_info = extract_place_info(tour_packages)
    
    data = []
    for _ in range(num_samples):
        age = np.random.randint(5, 80)
        gender = np.random.choice(['male', 'female'])
        place = np.random.choice(list(place_info.keys()))
        info = place_info[place]
        
        # Adjust probability based on age suitability
        age_min, age_max = info['age_range']
        age_prob = 1.0 if age_min <= age <= age_max else 0.3
        
        if np.random.random() < age_prob:
            data.append({
                'age': age,
                'gender': gender,
                'place_type': info['types'],
                'hobby': [np.random.choice(info['best_for'])],
                'climate': info['climate'],
                'health_issues': info['health_warnings'] if np.random.random() < 0.3 else [],
                'selected_place': place
            })
    
    return pd.DataFrame(data)

def preprocess_data(df):
    """Convert categorical data to numerical features"""
    # Initialize MultiLabelBinarizer for each multi-label column
    mlbs = {
        'place_type': MultiLabelBinarizer(),
        'hobby': MultiLabelBinarizer(),
        'health_issues': MultiLabelBinarizer()
    }
    
    # Fit and transform each multi-label column
    processed_dfs = []
    for col, mlb in mlbs.items():
        # Fit on all possible values
        unique_values = set()
        for values in df[col]:
            unique_values.update(values)
        mlb.fit([list(unique_values)])
        
        # Transform the column
        encoded = mlb.transform(df[col])
        encoded_df = pd.DataFrame(encoded, columns=[f"{col}_{v}" for v in mlb.classes_])
        processed_dfs.append(encoded_df)
        
        # Save the fitted binarizer
        joblib.dump(mlb, f'ml/trained_model/mlb_{col}.joblib')
    
    # Handle single-value categoricals
    df = pd.get_dummies(df, columns=['gender', 'climate'])
    
    # Combine all features
    processed = pd.concat([df.drop(['place_type', 'hobby', 'health_issues'], axis=1)] + processed_dfs, axis=1)
    
    return processed

def train_model():
    try:
        ensure_dir_exists('ml/dataset')
        ensure_dir_exists('ml/trained_model')
        
        print("Generating synthetic data using real place information...")
        df = generate_synthetic_data()
        df.to_csv('ml/dataset/recommendation_data.csv', index=False)
        
        print("Preprocessing data...")
        processed = preprocess_data(df)
        X = processed.drop('selected_place', axis=1)
        y = processed['selected_place']
        
        print("Saving feature columns...")
        with open('ml/trained_model/feature_columns.json', 'w') as f:
            json.dump(list(X.columns), f)
        
        print("Splitting data...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
        
        print("Training model...")
        model = RandomForestClassifier(
            n_estimators=300,
            max_depth=15,
            class_weight='balanced',
            random_state=42,
            verbose=1
        )
        model.fit(X_train, y_train)
        
        print("\nModel evaluation:")
        print(classification_report(y_test, model.predict(X_test)))
        
        print("Saving model...")
        joblib.dump(model, 'ml/trained_model/recommender.joblib')
        
        print("\nTraining completed successfully!")
        print(f"Trained on {len(df)} samples with {len(set(df['selected_place']))} unique places.")
        print("Saved artifacts:")
        print("- recommender.joblib (model)")
        print("- mlb_place_type.joblib (multi-label binarizer)")
        print("- mlb_hobby.joblib (multi-label binarizer)")
        print("- mlb_health_issues.joblib (multi-label binarizer)")
        print("- feature_columns.json (feature order)")
        
    except Exception as e:
        print(f"\nError during training: {str(e)}")
        raise

if __name__ == '__main__':
    train_model()