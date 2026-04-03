import sys
sys.path.append(r"c:\Users\Lenovo\Downloads\SERVICE\admin\adminback")
import auth as admin_auth

sys.path.remove(r"c:\Users\Lenovo\Downloads\SERVICE\admin\adminback")
sys.path.append(r"c:\Users\Lenovo\Downloads\SERVICE\main\backend")
import auth as main_auth

def check_keys():
    k1 = admin_auth.SECRET_KEY
    k2 = main_auth.SECRET_KEY
    print("Admin SECRET_KEY:", repr(k1), "Len:", len(k1))
    print("Main SECRET_KEY:", repr(k2), "Len:", len(k2))
    print("Match?", k1 == k2)

    # Let's also check default algorithm
    print("Admin Algo:", getattr(admin_auth, 'ALGORITHM', 'None'))
    print("Main Algo:", getattr(main_auth, 'ALGORITHM', 'None'))

if __name__ == "__main__":
    check_keys()
