{
  "merkle_combine_rule": {
    "algorithm": "SHA-256",
    "input": "concatenate left_hash + right_hash (as hex strings)",
    "output": "SHA256(left+right)",
    "truncation": "first 8 hex characters (32 bits)",
    "format": "truncated SHA-256, not fold",
    "example": "merkle_combine('c9e5b1e2', '2651f320') = SHA256('c9e5b1e22651f320')[:8]"
  },
  "hash_format": {
    "storage": "full SHA-256 (64 hex chars)",
    "display": "truncated to 8 chars for coordinates",
    "verification": "always use full hash, truncate only for display",
    "type": "truncated SHA-256, NOT fold, NOT XOR"
  },
  "leaves_1_3_filled": [
    {
      "coord": "R12-C01N",
      "hash_full": "d806280ab5530ad864bf8bd18fb05498c37bf8134b7008291ed42ebc51ff3476",
      "hash_trunc": "d806280a"
    },
    {
      "coord": "R12-C01P",
      "hash_full": "3700c640dc40e436f5625a35df87a08110ff0e56342d733eefcdefef038510c3",
      "hash_trunc": "3700c640"
    },
    {
      "coord": "R12-C02P",
      "hash_full": "15666de6ec763e6ddc42d48e9eadd2aefea73a7882198d35c4a4f9aae86a2917",
      "hash_trunc": "15666de6"
    }
  ],
  "leaves_4_18_queued": [
    {
      "leaf_number": 4,
      "coordinate": "R12-C03P",
      "offset": 3,
      "direction": "forward",
      "hash_full": "067f90b4239f17e756550cb3f6fc75dbfc7581ebe01f6039d03f1dc3cb1c83f2",
      "hash_truncated": "067f90b4",
      "status": "queued"
    },
    {
      "leaf_number": 5,
      "coordinate": "R12-C04P",
      "offset": 4,
      "direction": "forward",
      "hash_full": "6fbc46def9de1c7116f2f49adb6aa0fddccc07290d33c2997a910bc68245f7d9",
      "hash_truncated": "6fbc46de",
      "status": "queued"
    },
    {
      "leaf_number": 6,
      "coordinate": "R12-C05P",
      "offset": 5,
      "direction": "forward",
      "hash_full": "241bae0ee7aeb0ce48e27dd13ee74f2c44866cb27a182ac30bff81fb4a9e4cd8",
      "hash_truncated": "241bae0e",
      "status": "queued"
    },
    {
      "leaf_number": 7,
      "coordinate": "R12-C06P",
      "offset": 6,
      "direction": "forward",
      "hash_full": "363c4080d95f1aa9c43f9300041bcb7d308ad67a95c513ebb43a4b08bcd55a88",
      "hash_truncated": "363c4080",
      "status": "queued"
    },
    {
      "leaf_number": 8,
      "coordinate": "R12-C07P",
      "offset": 7,
      "direction": "forward",
      "hash_full": "534b819f465b809599b13efc69c28e4d0b816643d7d38cd4746e8724659e56b8",
      "hash_truncated": "534b819f",
      "status": "queued"
    },
    {
      "leaf_number": 9,
      "coordinate": "R12-C08P",
      "offset": 8,
      "direction": "forward",
      "hash_full": "52c929458a1cbb1f7fe4870109013e1bda076e806dad0448373a7996839074fd",
      "hash_truncated": "52c92945",
      "status": "queued"
    },
    {
      "leaf_number": 10,
      "coordinate": "R12-C09P",
      "offset": 9,
      "direction": "forward",
      "hash_full": "c6535e73c5b88c85f83c8e78e49871cce0e417b025a00b6703e85d60e4692f67",
      "hash_truncated": "c6535e73",
      "status": "queued"
    },
    {
      "leaf_number": 11,
      "coordinate": "R12-C02N",
      "offset": -2,
      "direction": "backward",
      "hash_full": "0e7bcefaf8ae73f2f4dab1177c918f0672f6d55928c8b18aa42728fb0d721673",
      "hash_truncated": "0e7bcefa",
      "status": "queued"
    },
    {
      "leaf_number": 12,
      "coordinate": "R12-C03N",
      "offset": -3,
      "direction": "backward",
      "hash_full": "70ed0944e5df0f3476ff202b34d5b54d2c56d59db031af7b19d25813e761c860",
      "hash_truncated": "70ed0944",
      "status": "queued"
    },
    {
      "leaf_number": 13,
      "coordinate": "R12-C04N",
      "offset": -4,
      "direction": "backward",
      "hash_full": "7dd9c8f4b46be751b14adfbd7baa66f98f525014643e9cd33ca26b7717b9ef91",
      "hash_truncated": "7dd9c8f4",
      "status": "queued"
    },
    {
      "leaf_number": 14,
      "coordinate": "R12-C05N",
      "offset": -5,
      "direction": "backward",
      "hash_full": "1bdb646433df3a2bebbcf3da3ea092f879a027f8727bd96edb631cdd98cd8d09",
      "hash_truncated": "1bdb6464",
      "status": "queued"
    },
    {
      "leaf_number": 15,
      "coordinate": "R12-C06N",
      "offset": -6,
      "direction": "backward",
      "hash_full": "db4edcbef413a8c9dcab28b8e35af1c4b3231798d6b31275d59cc33c234416c3",
      "hash_truncated": "db4edcbe",
      "status": "queued"
    },
    {
      "leaf_number": 16,
      "coordinate": "R12-C07N",
      "offset": -7,
      "direction": "backward",
      "hash_full": "d280b1dc16882053a5be154a1d4f0923f828bdea05494f815a80d250201e32ed",
      "hash_truncated": "d280b1dc",
      "status": "queued"
    },
    {
      "leaf_number": 17,
      "coordinate": "R12-C08N",
      "offset": -8,
      "direction": "backward",
      "hash_full": "458018b3cb443f926481419317f5027bb58373002fa61d2ab9fe7e5632dee728",
      "hash_truncated": "458018b3",
      "status": "queued"
    },
    {
      "leaf_number": 18,
      "coordinate": "R12-C09N",
      "offset": -9,
      "direction": "backward",
      "hash_full": "d52541fa0f7c1723a300c2b4a6bc462e226fffdbcaeb6e1c1fa70e5d78483a3e",
      "hash_truncated": "d52541fa",
      "status": "queued"
    }
  ],
  "merkle_path_example": {
    "level_0_center": "481a22fa",
    "level_1": "ab3b1582",
    "level_2": "58738915",
    "root_candidate": "62479048"
  }
}
