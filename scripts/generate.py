import json
import random

# List of slots
_slots = ['S1', 'S2', 'S3']
# List of days
_days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

# topic lists
topics = sorted(json.loads(open('src/data/topics.json').read()), key=lambda k: (-k['slots'], -len(k['ignore'])))
# Contributor details
contributors = json.loads(open('src/data/contributors.json').read())
# timetable data
timetable = json.loads(open('src/data/timetable.json').read())

# reset timetable
for day in _days:
    for slot in _slots:
        timetable[day][slot]['topic'] = ''
        timetable[day][slot]['assignee'] = ''

contributors_slot = {contributor['code']: contributor['slots']  for contributor in contributors}

# Loop though all topics
for index, topic in enumerate(topics):
    _contributors = []
    topic_slots = topic['slots']
    priority_contributors = []
    # loop through contributors
    for contributor in contributors:
        if contributors_slot[contributor['code']] < 1:
            continue
        if contributor['code'] in topic['ignore']:
            continue
        if contributor['code'] in topic['coverage']:
            continue
        # list of available contributors
        _contributors.append(contributor['code'])
        
    # if slot count is 7 then assume it as weekly quiz, hence push the topic to last slot.
    _slot = None if topic_slots != 7 else 'S3'
    
    # if sufficient contributors are not available then reset coverage but priortise the remaining first
    if topic_slots > len(_contributors):
        topics[index]['coverage'] = list()
        priority_contributors = _contributors
        _contributors = [contributor['code']  for contributor in contributors
                         if contributor['code'] not in topic['ignore'] and contributors_slot[contributor['code']] != 0]
    

    # set topic to random day and slot
    while topic_slots > 0:
        day = random.choice(_days)
        slot = _slot if _slot: else random.choice(_slots)

        if len(priority_contributors) > 0:
            priority = True
            contributor = random.choice(priority_contributors)
        else:
            priority = False
            contributor = random.choice(_contributors)

        assigned = any(_slot for _slot in _slots if timetable[day][_slot]['assignee'] == contributor)
        selected = any(_slot for _slot in _slots if timetable[day][_slot]['topic'] == topic['code'])

        if timetable[day][slot]['topic'] == '' and not assigned and not selected:
            if priority:
                priority_contributors.remove(contributor)
                _contributors.remove(contributor)
            else:
                _contributors.remove(contributor)

            topic_slots -= 1
            contributors_slot[contributor] -= 1
            topics[index]['coverage'].append(contributor)
            timetable[day][slot]['topic'] = topic['code']
            timetable[day][slot]['assignee'] = contributor

for day in _days:
    for slot in _slots:
        print("{} slot '{}' is assigned to {} for topic {}".format(day, slot, timetable[day][slot]['assignee'], timetable[day][slot]['topic']))

# dump the output files
_timetable = open('src/data/timetable.json', 'w')
_topics = open('src/data/topics.json', 'w')

_timetable.write(json.dumps(timetable, indent=4, sort_keys=False))
_topics.write(json.dumps(topics, indent=4, sort_keys=False))

_timetable.close()
_topics.close()
