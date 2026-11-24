import json
import sqlite3
import sys

sys.path.insert(0, '/root/My-Learn/server')
from services.knowledge_service import init_quiz_tables

conn = sqlite3.connect('/root/My-Learn/data/ulearn.db')
conn.execute('PRAGMA foreign_keys = ON')
init_quiz_tables(conn)

questions_part1 = [
    {
        "course_id": 75,
        "section_id": 502,
        "question_text": "Which layer of the OSI reference model is responsible for logical IP addressing and path determination?",
        "options": [
            "Layer 2 - Data Link Layer",
            "Layer 3 - Network Layer",
            "Layer 4 - Transport Layer",
            "Layer 7 - Application Layer"
        ],
        "correct_index": 1,
        "explanation": "Layer 3 (Network Layer) handles logical addressing (IPv4/IPv6) and routing/path determination between different subnets.",
        "difficulty": "easy"
    },
    {
        "course_id": 75,
        "section_id": 502,
        "question_text": "What is the correct protocol data unit (PDU) name for data encapsulated at the Transport Layer (Layer 4)?",
        "options": [
            "Frame",
            "Packet",
            "Segment",
            "Bit"
        ],
        "correct_index": 2,
        "explanation": "At Layer 4, the PDU is referred to as a Segment (for TCP) or Datagram (for UDP). Packets are Layer 3, Frames are Layer 2, and Bits are Layer 1.",
        "difficulty": "easy"
    },
    {
        "course_id": 75,
        "section_id": 502,
        "question_text": "Which field in an Ethernet II frame header is used to determine which Layer 3 protocol is encapsulated in the payload?",
        "options": [
            "Preamble",
            "Type / EtherType",
            "Frame Check Sequence (FCS)",
            "Start Frame Delimiter (SFD)"
        ],
        "correct_index": 1,
        "explanation": "The EtherType field (2 bytes) identifies the upper-layer protocol, such as 0x0800 for IPv4 or 0x86DD for IPv6.",
        "difficulty": "intermediate"
    },
    {
        "course_id": 75,
        "section_id": 502,
        "question_text": "In a standard Cat6 UTP cable using T568B pinout, which wire color connects to Pin 1 and Pin 2?",
        "options": [
            "Pin 1: White/Green, Pin 2: Green",
            "Pin 1: White/Orange, Pin 2: Orange",
            "Pin 1: White/Blue, Pin 2: Blue",
            "Pin 1: White/Brown, Pin 2: Brown"
        ],
        "correct_index": 1,
        "explanation": "T568B order starts with White/Orange (Pin 1), Orange (Pin 2), White/Green (Pin 3), Blue (Pin 4), White/Blue (Pin 5), Green (Pin 6), White/Brown (Pin 7), Brown (Pin 8).",
        "difficulty": "intermediate"
    },
    {
        "course_id": 75,
        "section_id": 502,
        "question_text": "Which component of a MAC address indicates the vendor/manufacturer assigned by IEEE?",
        "options": [
            "The first 24 bits (OUI - Organizationally Unique Identifier)",
            "The last 24 bits (NIC specific extension)",
            "The FCS checksum bits",
            "The broadcast bit only"
        ],
        "correct_index": 0,
        "explanation": "A 48-bit MAC address consists of a 24-bit OUI (identifying the manufacturer) and a 24-bit vendor-assigned network interface controller identifier.",
        "difficulty": "easy"
    },
    {
        "course_id": 75,
        "section_id": 502,
        "question_text": "What mechanism does CSMA/CD use when two nodes on a half-duplex Ethernet segment transmit simultaneously?",
        "options": [
            "Both stations increase transmission power",
            "Stations detect collision, send a jam signal, and wait a random backoff time",
            "The switch pauses frame forwarding for 1 second",
            "The frames are retransmitted immediately without delay"
        ],
        "correct_index": 1,
        "explanation": "Under CSMA/CD, upon collision detection, transmitting nodes send a 32-bit jam signal and execute an exponential backoff algorithm before attempting retransmission.",
        "difficulty": "intermediate"
    },
    {
        "course_id": 75,
        "section_id": 502,
        "question_text": "Which statement accurately describes a collision domain versus a broadcast domain on standard Layer 2 switches?",
        "options": [
            "Each switch port is a separate broadcast domain",
            "Each switch port is a separate collision domain, but all ports in the same VLAN share a single broadcast domain",
            "Hubs divide collision domains, while switches divide broadcast domains",
            "Routers maintain a single broadcast domain across all interfaces"
        ],
        "correct_index": 1,
        "explanation": "Switches break up collision domains per micro-segmented port. However, broadcast frames (e.g., ARP requests) are flooded out all ports in the same VLAN/broadcast domain.",
        "difficulty": "intermediate"
    },
    {
        "course_id": 75,
        "section_id": 502,
        "question_text": "When a router forwards an IPv4 packet across a hop, which headers are modified?",
        "options": [
            "Neither Layer 2 nor Layer 3 headers are modified",
            "Both Source/Destination IP and Layer 2 MAC addresses are changed entirely",
            "Layer 2 Source and Destination MAC addresses are rewritten, and TTL is decremented in Layer 3 header",
            "Only the TCP sequence number is updated"
        ],
        "correct_index": 2,
        "explanation": "As a packet traverses router hops, the router strips the old Layer 2 frame and creates a new one with its outgoing interface MAC as source and the next hop/destination MAC as destination. In the Layer 3 header, TTL is decremented by 1 and the IPv4 header checksum is recomputed.",
        "difficulty": "intermediate"
    }
]

for q in questions_part1:
    existing = conn.execute(
        'SELECT id FROM quiz_questions WHERE course_id = ? AND section_id = ? AND question_text = ?',
        (q["course_id"], q["section_id"], q["question_text"])
    ).fetchone()
    if not existing:
        conn.execute(
            'INSERT INTO quiz_questions (course_id, section_id, question_text, explanation, options_json, correct_index, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (
                q["course_id"],
                q["section_id"],
                q["question_text"],
                q["explanation"],
                json.dumps(q["options"]),
                q["correct_index"],
                q["difficulty"],
            )
        )

conn.commit()
count = conn.execute('SELECT COUNT(*) FROM quiz_questions').fetchone()[0]
print(f'Total quiz questions: {count}')
conn.close()
