from applescript import AppleScript

# a function to check for incomplete reminders in the Reminders app
def check_missed_deadline_reminders(list_name):
    script = AppleScript(f'''
    tell application "Reminders"
        set rems to reminders in list "{list_name}"
        set current_time to current date
        set missed_reminders to {{}}
        repeat with rem in rems
            if (due date of rem is not missing value) and (due date of rem < current_time) then
                set end of missed_reminders to name of rem
            end if
        end repeat
        return missed_reminders
    end tell
    ''')
    missed_deadline_reminders = script.run()
    if missed_deadline_reminders:
        print("Reminders that missed deadline:", missed_deadline_reminders)
    else:
        print("No reminders missed their deadline.")

check_missed_deadline_reminders("Personal")