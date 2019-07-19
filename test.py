#!/usr/bin/python3.6
import re


re_str = r'Hello World(.*)';

test_str = 'Hello World dsadasdasdasdasd';

result = re.search(re_str,test_str);

print (result.group(1));
