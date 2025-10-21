from hypothesis import given, strategies as st
import json
import importlib

# Expect these pure functions to exist (old & new impls)
old = importlib.import_module('estimator_old').estimate
new = importlib.import_module('estimator_new').estimate

@given(st.dictionaries(keys=st.text(min_size=1, max_size=15),
                       values=st.integers(min_value=0, max_value=100)))
def test_equivalence(params):
    assert json.dumps(old(params), sort_keys=True) == json.dumps(new(params), sort_keys=True)
