import pandas as pd

try:
    df = pd.read_excel('verified_trace.xlsx', header=None)
    if 'Lakukan enkripsi' in str(df.iloc[0, 0]):
        print("YES_HEADER_FOUND")
    else:
        print("NO_HEADER_MISSING")
        print("First cell content:", df.iloc[0, 0])
except Exception as e:
    print(f"Error reading Excel: {e}")
