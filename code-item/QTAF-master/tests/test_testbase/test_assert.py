# -*- coding: utf-8 -*-
#
# Tencent is pleased to support the open source community by making QTA available.
# Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
# Licensed under the BSD 3-Clause License (the "License"); you may not use this
# file except in compliance with the License. You may obtain a copy of the License at
#
# https://opensource.org/licenses/BSD-3-Clause
#
# Unless required by applicable law or agreed to in writing, software distributed
# under the License is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS
# OF ANY KIND, either express or implied. See the License for the specific language
# governing permissions and limitations under the License.
#
"""testcase for testbase.asserts
"""

import unittest

from testbase.testcase import TestCase
from testbase.datadrive import DataDrive
from testbase.test import modify_settings


class AssertionFailureTest(TestCase):
    """dummy class for asserts test
    """
    owner = "dummy"
    timeout = 10
    priority = TestCase.EnumPriority.High
    status = TestCase.EnumStatus.Ready

    def run_test(self):
        self.start_step("step 1")
        self.assert_("assert1", self.bar(1) in [1, 4])
        self.start_step("step 2")
        self.assert_("assert", self.foo(self.bar(1)) in [2, 4])

    def foo(self, a):
        return a + 1

    def bar(self, b):
        return b + 1

class AssertionInnerInvokeTest(AssertionFailureTest):
    """xxxx
    """
    def run_test(self):
        self.assert_foo_bar()

    def assert_foo_bar(self):
        self.assert_("assert", self.foo(self.bar(1)) in [2, 4])

    def assert_foo_bar_with_for(self):
        for _ in range(2):
            self.assert_("assert", self.foo(self.bar(1)) in [2, 4])


class AssertionInnerInvokeForTest(AssertionFailureTest):
    """xxxx
    """
    def run_test(self):
        self.assert_foo_bar()

    def assert_foo_bar_with_for(self):
        for _ in range(2):
            self.assert_("assert", self.foo(self.bar(1)) in [2, 4])


@DataDrive([1,2])
class AssertionDatadriveTest(AssertionFailureTest):
    """dummy class for asserts test
    """
    def run_test(self):
        self.assert_("assert", self.foo(self.bar(1)) in [2, 4])


class AssertionTest(unittest.TestCase):
    """unit test for assertion
    """
    def is_func_rewritten(self, new_func, old_code):
        new_code = new_func.__func__.__code__
        return new_code != old_code

    def test_assert_failure(self):
        case = AssertionFailureTest()
        old_run_test_code = case.run_test.__func__.__code__
        case.debug_run()
        self.assertEqual(case.test_result.passed, False, "断言失败，用例没有失败")
        self.assertEqual(len(case.test_result._step_results), 2, "设置了断言失败继续执行，但是用例没有继续执行")
        self.assertEqual(self.is_func_rewritten(case.run_test, old_run_test_code), True, "重写assert失败，code对象没有改变")

    def test_assert_inner_invoke(self):
        case = AssertionInnerInvokeTest()
        old_assert_foo_bar_code = case.assert_foo_bar.__func__.__code__
        case.debug_run()

        self.assertEqual(case.test_result.passed, False, "断言失败，用例没有失败")
        self.assertEqual(self.is_func_rewritten(case.assert_foo_bar, old_assert_foo_bar_code), True, "重写assert失败，code对象没有改变")

    def test_assert_inner_invoke_with_for(self):
        case = AssertionInnerInvokeForTest()
        old_assert_foo_bar_with_for_code = case.assert_foo_bar_with_for.__func__.__code__
        case.debug_run()

        self.assertEqual(case.test_result.passed, False, "断言失败，用例没有失败")
        self.assertEqual(self.is_func_rewritten(case.assert_foo_bar_with_for, old_assert_foo_bar_with_for_code), True, "重写assert失败，code对象没有改变")

    def test_assert_datadrive(self):
        case = AssertionDatadriveTest()
        old_run_test_code = case.run_test.__func__.__code__

        report = case.debug_run_one(0)
        self.assertEqual(report.is_passed(), False, "数据驱动断言失败，用例没有失败")

        report = case.debug_run_one(1)
        self.assertEqual(report.is_passed(), False, "数据驱动断言失败，用例没有失败")

        self.assertEqual(self.is_func_rewritten(case.run_test, old_run_test_code), True, "重写assert失败，code对象没有改变")

    def test_disable_rewrite_assert(self):
        with modify_settings(QTAF_REWRITE_ASSERT=False):
            case = AssertionFailureTest()
            old_run_test_code = case.run_test.__func__.__code__
            case.debug_run()
            self.assertEqual(case.test_result.passed, False, "禁用重写assert，用例没有失败")
            self.assertEqual(self.is_func_rewritten(case.run_test, old_run_test_code), False, "禁用重写assert，assert_被重写了")

    def test_disable_assert_failed_continue(self):
        with modify_settings(QTAF_ASSERT_CONTINUE=False):
            case = AssertionFailureTest()
            case.debug_run()
            self.assertEqual(case.test_result.passed, False, "断言失败退出执行，用例没有失败")
            self.assertEqual(len(case.test_result._step_results), 1, u"设置了断言失败退出执行，但是用例仍继续执行")


if __name__ == "__main__":
    unittest.main()
