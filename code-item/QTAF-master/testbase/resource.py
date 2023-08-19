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
"""
资源管理模块

包括：协作机管理及测试资源文件管理
"""

import os
import sys
import locale
import uuid
import csv

from testbase import context
import testbase.logger as logger
from testbase.conf import settings
from testbase.util import smart_text, codecs_open
from testbase.testresult import EnumLogLevel

os_encoding = locale.getdefaultlocale()[1]
if not os_encoding:
    os_encoding = 'utf8'


class ResourceNotAvailable(Exception):
    """没有可用的资源
    """
    pass


class DownloadFileError(Exception):
    """download file failed
    """

    def __init__(self, url, status_code, msg, headers, data):
        self.url = url
        self.status_code = status_code
        self.msg = msg
        self.headers = headers
        self.data = data

    def __str__(self):
        return "downloading file failed for: %s %s %s\nheaders=%s\nbody=%s" % (self.url,
                                                             self.status_code,
                                                             self.msg,
                                                             self.headers,
                                                             smart_text(self.data))




class Session(object):
    """会话
    """

    def __init__(self, backend, session_id):
        """构造函数
        """
        self._backend = backend
        self._id = session_id

    def acquire_resource(self, res_type, res_group=None, condition=None):
        """申请资源

        :param res_type: 资源类型
        :type res_type: str
        :param res_group: 资源分组
        :type res_type: str
        :param condition: 资源属性匹配
        :type condition: dict
        :returns: 资源
        :rtypes: dict
        """
        tc = context.current_testresult()
        try:
            resource = self._backend.acquire_resource(self._id, res_type, res_group, condition)
        except ResourceNotAvailable:
            if tc:
                tc.log_record(EnumLogLevel.RESNOTREADY, "acquire resource (res_type:%s, res_group:%s, condition:%s) failed" % (res_type, res_group, condition))
            raise
        else:
            if tc:
                extra = {}
                extra["res_type"] = res_type
                if not isinstance(resource, dict):
                    raise ValueError("Resource record should be a dictionary")
                if "id" not in resource:
                    raise ValueError("Resource record should be a dictionary with key 'id'")
                extra["resource_id"] = resource["id"]
                tc.log_record(EnumLogLevel.RESOURCE, "acquire resource (res_type:%s, res_group:%s, condition:%s) successfully" % (res_type, res_group, condition), extra)
            return resource

    def release_resource(self, res_type, resource_id):
        """释放资源

        :param res_type: 资源类型
        :type res_type: str
        :param resource_id: 资源ID
        :type resource_id: str
        """
        return self._backend.release_resource(self._id, res_type, resource_id)

    def destroy(self):
        """销毁该会话（全部占用的资源会释放）
        """
        if not self._id:
            return
        res = self._backend.destroy_session(self._id)
        self._id = None
        return res

    def get_file(self, path):
        """获取测试文件资源

        :param path: 文件引用路径（相对路径）
        :returns: 文件路径
        :rtypes: str
        """
        return self._backend.get_file(path)

    def list_dir(self, path):
        """获取目录下文件列表

        :param path: 目录引用路径（相对路径）
        :returns: 一个包含该目录下所有文件的绝对路径的list 
        :rtypes: list[str]
        """
        return self._backend.list_dir(path)

    def walk(self, path):
        """获取目录下文件列表

        :param path: 相对于resources目录的路径，用于遍历文件夹
        :type  path: str
        :return iterators: iterator of (dir_path, dirnames, filenames) tuples
        :type   iterators: iterator
        """
        return self._backend.walk(path)


class IResourceManagerBackend(object):
    """测试资源管理后端接口定义
    """

    def create_session(self, testcase=None):
        """创建会话

        :param testcase: 使用的测试用例
        :type testcase: TestCase
        :returns: 会话ID
        :rtypes: str
        """
        raise NotImplementedError()

    def destroy_session(self, session_id):
        """销毁会话

        :param session_id: 会话ID
        :type session_id: str
        """
        raise NotImplementedError()

    def acquire_resource(self, session_id, res_type, res_group, condition):
        """申请资源

        :param session_id: 会话ID
        :type session_id: str
        :param res_type: 资源类型
        :type res_type: str
        :param res_group: 资源分组
        :type res_type: str
        :param condition: 资源属性匹配
        :type condition: dict
        :returns: 资源
        :rtypes: dict
        """
        raise NotImplementedError()

    def release_resource(self, session_id, res_type, resource_id):
        """释放资源

        :param session_id: 会话ID
        :type session_id: str
        :param res_type: 资源类型
        :type res_type: str
        :param resource_id: 资源ID
        :type resource_id: str
        """
        raise NotImplementedError()

    def get_file(self, path):
        """获取一个文件资源

        :param path: 相对于resources目录的文件路径
        :type path: str
        :returns: 文件绝对路径
        :rtypes: str
        """
        raise NotImplementedError()

    def list_dir(self, path):
        """获取一个文件资源

        :param path: 相对于resources目录的文件夹路径
        :type path: str
        :returns: 文件绝对路径
        :rtypes: str
        """
        raise NotImplementedError()

    def walk(self, path):
        """遍历一个文件路径

        :param path: 相对于resources目录的文件夹路径
        :type path: str
        :returns: 返回一个迭代器，每次迭代对应一个(dir_path, dir_names, file_names)的元组
        :rtypes: iterator
        """
        raise NotImplementedError()

    def iter_managed_resource(self):
        """查询全部托管的资源（支持初始化&反初始化）

        :returns: iterator of (res_type, resource)
        :rtypes: iterator(res_type, resource)
        """
        raise NotImplementedError()


class TestResourceManager(object):
    """测试资源管理"""

    def __init__(self, backend):
        self._backend = backend

    def create_session(self, testcase=None):
        """创建资源使用会话

        :param testcase: 使用的测试用例
        :type testcase: TestCase
        :returns: 会话
        :rtype: Session
        """
        session_id = self._backend.create_session(testcase)
        return Session(self._backend, session_id)

    def iter_managed_resource(self):
        """查询全部托管的资源（支持初始化&反初始化）

        :returns: iterator of (res_type, resource)
        :rtypes: iterator(str, dict)
        """
        return self._backend.iter_managed_resource()


class LocalResourceLock(object):
    """本地资源锁
    """

    _lock_cache = {}

    def __init__(self, res_type, resource_id):
        self._res_type = res_type
        self._resource_id = resource_id
        if sys.platform == "win32":
            lock_dir = os.path.join(os.environ["AppData"], "QTAF", "lock", res_type)
            self._os_try_acquire = self._win_try_acquire
            self._os_release = self._win_release
        else:  # linux/mac
            lock_dir = os.path.join(os.environ["HOME"], ".qtaf", "lock", res_type)
            self._os_try_acquire = self._unix_try_acquire
            self._os_release = self._unix_release
        if not os.path.isdir(lock_dir):
            os.makedirs(lock_dir)
        self._file_path = os.path.join(lock_dir, str(resource_id))
        self._fd = None

    def try_acquire(self):
        """尝试加锁

        :returns: 是否成功
        """
        if self._file_path in self._lock_cache:
            return False
        if self._os_try_acquire():
            self._lock_cache[self._file_path] = self
            return True
        return False

    def release(self):
        """释放
        """
        if self._fd is None:
            raise RuntimeError("lock is not acquired")
        del self._lock_cache[self._file_path]
        return self._os_release()

    def _win_try_acquire(self):
        import msvcrt
        try:
            fd = os.open(self._file_path, os.O_RDWR | os.O_CREAT | os.O_TRUNC)
        except OSError:
            pass
        else:
            try:
                msvcrt.locking(fd, msvcrt.LK_NBLCK, 1)
            except (IOError, OSError):
                os.close(fd)
            else:
                self._fd = fd
                return True
        return False

    def _win_release(self):
        import msvcrt
        msvcrt.locking(self._fd, msvcrt.LK_UNLCK, 1)
        os.close(self._fd)
        try:
            os.remove(self._file_path)
        except OSError:
            pass
        self._fd = None

    def _unix_try_acquire(self):
        import fcntl
        fd = os.open(self._file_path, os.O_RDWR | os.O_CREAT | os.O_TRUNC)
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except (IOError, OSError):
            os.close(fd)
        else:
            self._fd = fd
            return True
        return False

    def _unix_release(self):
        import fcntl
        fcntl.flock(self._fd, fcntl.LOCK_UN)
        os.close(self._fd)
        self._fd = None


class LocalResourceHandler(object):
    """本地资源处理句柄
    """

    def __init__(self, resource_lock_type=LocalResourceLock):
        """构造函数

        :param resource_lock_type: 资源锁类型
        :type resource_lock_type: type
        """
        self._lock_type = LocalResourceLock
        self._res_locks = {}

    def acquire_resource(self, session_id, res_type, res_group, condition):
        """申请资源
    
        :param session_id: 会话ID
        :type session_id: str
        :param res_type: 资源类型
        :type res_type: str
        :param res_group: 资源分组
        :type res_group: str
        :param condition: 资源属性匹配
        :type condition: dict
        :returns: 资源
        :rtype: dict
        """
        for it in self.iter_resource(res_group, condition):
            if not isinstance(it, dict):
                raise ValueError("Resource record should be a dictionary")
            if "id" not in it:
                raise ValueError("Resource record should be a dictionary with key 'id'")
            resource_id = it["id"]
            lock = self._lock_type(res_type, resource_id)
            if lock.try_acquire():
                self._res_locks.setdefault(session_id, [])
                self._res_locks[session_id].append((res_type, resource_id, lock))
                return it
        else:
            raise ResourceNotAvailable()

    def release_resource(self, session_id, res_type, resource_id):
        """释放资源

        :param session_id: 会话ID
        :type session_id: str
        :param res_type: 资源类型
        :type res_type: str
        :param resource_id: 资源ID
        :type resource_id: str
        """
        if session_id not in self._res_locks:
            raise ValueError("invalid session")
        for idx, (_res_type, _resource_id, lock) in enumerate(self._res_locks[session_id]):
            if _res_type == res_type and _resource_id == resource_id:
                lock.release()
            del self._res_locks[session_id][idx]
            break
        else:
            raise ValueError("resource is not acquired yet")

    def session_created(self, session_id, timeout, testcase=None):
        """通知会话创建

        :param session_id: 会话ID
        :type session_id: str
        :param timeout: 会话超时时间（秒）
        :type timeout: int
        :param testcase: 当前用例
        :type testcase: testbase.testcase.TestCase
        """
        pass

    def session_destroyed(self, session_id):
        """通知会话销毁

        :param session_id: 会话ID
        :type session_id: str
        """
        if session_id in self._res_locks:
            for _, _, lock in self._res_locks[session_id]:
                lock.release()
            del self._res_locks[session_id]

    def iter_resource(self, res_type, res_group=None, condition=None):
        """遍历全部资源（可以按照优先级顺序返回来影响申请资源的优先级）

        :param res_type: 资源类型
        :type res_type: str
        :param res_group: 资源分组
        :type res_group: str
        :param condition: 资源属性匹配
        :type condition: dict
        :returns: iterator of resource, dict type with key 'id'
        :rtypes: iterator(dict)
        """
        raise NotImplementedError()

    def iter_managed_resource(self, res_type):
        """查询全部托管的资源（支持初始化&反初始化）

        :returns: iterator of resource
        :rtypes: iterator(dict)
        """
        return self.iter_resource(res_type)


class LocalCSVResourceHandler(LocalResourceHandler):
    """基于本地CSV文件管理资源
    """

    def __init__(self, csv_path, resource_lock_type=LocalResourceLock):
        """构造函数

        :param csv_path: CSV文件
        :type csv_path: str
        :param resource_lock_type: 资源锁类型
        :type resource_lock_type: type
        """
        self._csv_path = csv_path
        super(LocalCSVResourceHandler, self).__init__(resource_lock_type)

    def iter_resource(self, res_type, res_group=None, condition=None):
        """遍历全部资源（可以按照优先级顺序返回来影响申请资源的优先级）

        :param res_type: 资源类型
        :type res_type: str
        :param res_group: 资源分组
        :type res_group: str
        :param condition: 资源属性匹配
        :type condition: dict
        :returns: iterator of resource
        :rtypes: iterator(dict)
        """
        with codecs_open(self._csv_path, "rb", encoding="utf-8") as fd:
            for rowid, row in enumerate(csv.DictReader(fd)):
                if "id" not in row:
                    row["id"] = rowid
                    yield row


class LocalResourceManagerBackend(IResourceManagerBackend):
    """基本本地文件的方式的资源管理
    """
    _res_type_map = {}

    @classmethod
    def register_resource_type(cls, res_type, handler):
        """注册一个资源类型
        """
        cls._res_type_map[res_type] = handler

    def __init__(self):
        self._resources_dirs = iter_resource_paths()
        self._session_path = os.path.join(settings.PROJECT_ROOT, 'sessions')

    def _adjust_path(self, path):
        """根据操作系统转换文件分隔符
        """
        if os.sep == '/':
            return path.replace('\\', os.sep)
        else:
            return path.replace('/', os.sep)

    def _download_file(self, url, target_path):
        from six.moves.urllib import request, error
        try:
            rsp = request.urlopen(url, timeout=300)
            rspbuf = rsp.read()
        except error.HTTPError as e:
            raise DownloadFileError(url, e.code, e.msg, e.headers, e.read())
        with codecs_open(target_path, "wb") as fd:
            fd.write(rspbuf)

    def _resolve_link_file(self, remote_path, prefer_local_path):
        """获取链接的真正的文件
        """
        if os.path.isfile(remote_path):
            return remote_path
        elif remote_path.startswith("http://") or remote_path.startswith("https://"):
            self._download_file(remote_path, prefer_local_path)
            return prefer_local_path
        else:
            raise ValueError("Invalid link file path: %s" % remote_path)

    def abs_path(self, relative_path):
        """get resource absolute path
:        type relative_path:string
        :param relative_path: ，资源文件相对描述符，相对于setting下的资源目录的路径,支持多级目录
        :return:返回资源文件的绝对路径
        """
        relative_path = self._adjust_path(relative_path)
        if relative_path.startswith(os.sep):
            relative_path = relative_path[1:]

        found_paths = []
        for it in self._resources_dirs:
            file_path = self._adjust_path(os.path.join(it, relative_path))
            file_path = smart_text(file_path)
            file_link = smart_text(file_path + '.link')
            if os.path.exists(file_path):
                found_paths.append(file_path)
            elif os.path.exists(file_link):
                with codecs_open(file_link, encoding="utf-8") as f:
                    remote_path = f.read()
                    file_path = self._resolve_link_file(remote_path, file_path)
                    found_paths.append(file_path)
        if len(found_paths) == 0:
            raise Exception("relative_path=%s not found" % relative_path)
        if len(found_paths) > 1:
            raise Exception("relative_path=%s got multiple results:\n%s" % (relative_path, "\n".join(found_paths)))
        return os.path.abspath(found_paths[0])

    def get_file(self, relative_path):
        """查找某个文件

        :type relative_path:string
        :param relative_path: 资源文件相对描述符，相对于setting下的资源目录的路径,支持多级目录
        :return:返回资源文件的绝对路径
        """
        abs_path = self.abs_path(relative_path)
        if os.path.isfile(abs_path):
            return abs_path
        else:
            raise ValueError("relative path=%s is a directory" % relative_path)

    def list_dir(self, relative_path):
        """列出某个目录下的文件

        :type relative_path:string
        :param relative_path: ，资源文件目录相对路径，相对于setting下的资源目录的路径,支持多级目录
        :return:返回一个包含资源目录下所有文件或者文件下的相对路径列表
        """
        abs_path = self.abs_path(relative_path)
        sub_items = os.listdir(abs_path)
        items = []
        for sub_item in sub_items:
            if sub_item[-5:] == ".link":
                sub_item = sub_item[:-5]
            items.append(sub_item)
        return items

    def walk(self, path):
        """获取目录下文件列表

        :param path: 相对于resources目录的路径，用于遍历文件夹
        :type  path: str
        :return iterators: iterator of (dir_path, dirnames, filenames) tuples
        :type   iterators: iterator
        """
        abs_path = self.abs_path(path)
        base_len = len(os.path.dirname(abs_path)) + 1
        for dir_path, dir_names, file_names in os.walk(abs_path):
            for index, file_name in enumerate(file_names):
                if file_name.endswith(".link"):
                    file_names[index] = file_name[-5:]
            yield dir_path[base_len:], dir_names, file_names

    def _clean_cache(self):
        """清理缓存文件
        """
        for it in self._resources_dirs:
            self._rm_cachefile_recursively(it)

    def _rm_cachefile_recursively(self, path):
        """递归删除目录下的缓存文件
        """
        for root, _, files in os.walk(path):
            for it in files:
                if it.endswith('.link'):
                    try:
                        os.remove(os.path.join(root, it)[0:-5])
                    except OSError:
                        pass

    def create_session(self, testcase=None):
        """创建会话
        """
        session_id = str(uuid.uuid4())
        timeout = 300 if testcase is None else (testcase.timeout * 60 + 300 + 5)  # 300为用例超时时的Cleanup超时时间
        for handler in self._res_type_map.values():
            handler.session_created(session_id, timeout, testcase)
        return session_id

    def destroy_session(self, sessionid):
        """销毁会话
        """
        self._clean_cache()
        for handler in self._res_type_map.values():
            handler.session_destroyed(sessionid)

    def acquire_resource(self, session_id, res_type, res_group, condition):
        """申请资源
        """
        handler = self._res_type_map.get(res_type)
        if handler is None:
            raise ValueError("resource type '%s' it not registered")
        return handler.acquire_resource(session_id, res_type, res_group, condition)

    def release_resource(self, session_id, res_type, resource_id):
        """释放资源
        """
        handler = self._res_type_map.get(res_type)
        if handler is None:
            raise ValueError("resource type '%s' it not registered")
        return handler.release_resource(session_id, res_type, resource_id)

    def iter_managed_resource(self):
        """查询全部托管的资源（支持初始化&反初始化）

        :returns: iterator(res_type, resource)
        """
        for res_type, handler in self._res_type_map.items():
            for it in handler.iter_managed_resource(res_type):
                yield (res_type, it)


def _current_resmgr_session():
    tc = context.current_testcase()
    if tc is None:
        logger.warn("注意！非用例模式，将返回默认测试文件资源管理器，此处调用可能在测试环境下异常")
        return TestResourceManager(LocalResourceManagerBackend()).create_session()
    return tc.test_resources


def get_file(path):
    """查找某个文件
    :param path: 相对于resources目录的路径，用于查找文件
    :type path: str
    :return:返回资源文件的绝对路径
    """
    return _current_resmgr_session().get_file(path)


def list_dir(path):
    """列出某个目录下的文件
    :param path: 相对于resources目录的路径，用于查找文件夹
    :type path: str
    :returns :返回一个包含资源目录下所有文件或者文件下的绝对路径的list
    """
    return _current_resmgr_session().list_dir(path)


def walk(path):
    """遍历某个路径
    
    :param path: 相对于resources目录的路径，用于遍历文件夹
    :type  path: str
    :return iterators: iterator of (dir_path, dirnames, filenames) tuples
    :type   iterators: iterator
    """
    return _current_resmgr_session().walk(path)


def acquire_resource(res_type, res_group=None, condition=None):
    """申请资源

    :param res_type: 资源类型
    :type res_type: str
    :param res_group: 资源分组
    :type res_type: str
    :param condition: 资源属性匹配
    :type condition: dict
    :returns: 资源
    :rtypes: dict
    """
    return _current_resmgr_session().acquire_resource(res_type, res_group, condition)


def release_resource(res_type, resource_id):
    """释放资源

    :param res_type: 资源类型
    :type res_type: str
    :param resource_id: 资源ID
    :type resource_id: str
    """
    return _current_resmgr_session().release_resource(res_type, resource_id)


def iter_resource_paths():
    """返回测试项目的全部resources目录

    :return: 
    """
    resource_paths = []
    for dirpath, dirnames, _ in os.walk(settings.PROJECT_ROOT):
        for dirname in dirnames:
            if dirname == 'resources':
                resource_paths.append(os.path.join(dirpath, dirname))
    return resource_paths

