<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
      <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-button type="primary" @click="addDialogVisible=true">新增角色</el-button>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" style="width: 100%">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['vcenter','bdbottom',i1 === 0 ? 'bdtop' : '']" v-for="(item1 ,i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 v-for 嵌套 渲染二级权限 -->
                <el-row :class="['vcenter',i2===0?'':'bdtop']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3, i3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#" width="50px"></el-table-column>

        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id)">删除</el-button>
            <!-- 分配角色按钮 -->
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增角色对话框 -->
    <el-dialog title="新增角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="showRightDialogVisible" width="50%" @close="defKeys = []">
      <!-- 树形结构 -->
      <el-tree :data="rightList" :props="treeProps" ref="treeRef" default-expand-all show-checkbox node-key="id" :default-checked-keys="defKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色的列表数据
      rolesList: [],
      // 控制新增角色对话框的显示与隐藏
      addDialogVisible: false,
      // 新增角色表单对象
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 新增角色表单的验证规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名称长度在 2 到 10 之间', trigger: 'blur' }
        ]
      },
      // 控制编辑角色对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑角色表单对象
      editForm: {},
      // 编辑角色表单的验证规则
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名称长度在 2 到 10 之间', trigger: 'blur' }
        ]
      },
      showRightDialogVisible: false,
      // 权限数据
      rightList: [],
      // 树形对象的绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认勾选的节点数组
      defKeys: [],
      // 当前即将分配权限的角色ID
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  mounted() {},
  methods: {
    //   获取所有角色的列表数据
    async getRolesList() {
      const { data: res } = await this.$axios.get('/api2/roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesList = res.data
    },
    // 根据ID删除对应权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm('此操作将删除该角色的权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') return this.$message.info('取消了删除操作')
      const { data: res } = await this.$axios.delete(`/api2/roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('取消权限失败')
      this.$message.success('取消权限成功')

      // 刷新当前角色的数据
      role.children = res.data
    },
    // 新增角色对话框关闭时重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 新增角色
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('表单验证失败')
        // 发起post请求,新增角色
        const { data: res } = await this.$axios.post('/api2/roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('新增角色失败')
        // 刷新角色列表数据
        this.getRolesList()
        // 关闭对话框
        this.addDialogVisible = false
        // 提示成功消息
        this.$message.success('新增角色成功')
      })
    },
    // 显示编辑角色对话框,根据角色ID查询角色信息
    async showEditDialog(id) {
      const { data: res } = await this.$axios.get('/api2/roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询角色信息失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 编辑角色对话框关闭时重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 提交更新角色请求
    editRole() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('表单验证失败')
        // 发起put请求，更新角色
        console.log(this.editForm)
        const { data: res } = await this.$axios.put('/api2/roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('更新角色失败')
        // 更新角色列表数据
        this.getRolesList()
        // 关闭对话框
        this.editDialogVisible = false
        // 提示更新角色成功
        this.$message.success('更新角色成功')
      })
    },
    // 删除操作
    async deleteRole(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除')
      // 用户确认了删除，发起delete请求删除角色
      const { data: res } = await this.$axios.delete('/api2/roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      // 刷新角色列表
      this.getRolesList()
      // 提示删除成功
      this.$message.success('删除成功')
    },
    // 展示分配权限的对话框
    async showRightDialog(role) {
      // 设置即将分配权限的角色ID
      this.roleId = role.id
      // 获取权限数据
      const { data: res } = await this.$axios.get('/api2/rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.rightList = res.data
      // 获取所有三级节点的ID
      this.getLeafKey(role, this.defKeys)

      // 显示分配权限对话框
      this.showRightDialogVisible = true
    },
    // 递归判断是否为三级节点，并将三级节点的id保存到数组中
    getLeafKey(node, arr) {
      // 如果当前节点包含children，就不是三级节点
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => this.getLeafKey(item, arr))
    },
    // 点击为角色分配权限
    async allotRight(role) {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')

      const { data: res } = await this.$axios.post(`/api2/roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      // 刷新角色列表事件
      this.getRolesList()
      // 关闭提示框
      this.showRightDialogVisible = false
      // 提示成功
      this.$message.success('分配权限成功')
    }
  }
}
</script>

<style scoped lang="less">
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
