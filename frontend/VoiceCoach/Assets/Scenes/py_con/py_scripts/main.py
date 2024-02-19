import librosa
import pandas as pd
import matplotlib.pylab as plt
import numpy as np
import librosa.display
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean

class Greeter():
    def __init__(self, name):
        self.name = name
    def greet(self):
        return "Hi, " + self.name

greeter = Greeter("eli")
f = open('Assets/Scenes/py_con/files/ans.txt', 'w+')
f.write(greeter.greet())
f.close()