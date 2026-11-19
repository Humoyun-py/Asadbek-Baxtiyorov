from rest_framework.permissions import SAFE_METHODS, BasePermission

SUPERADMIN, ADMIN, EDITOR = 'SUPERADMIN', 'ADMIN', 'EDITOR'
RANK = {EDITOR: 1, ADMIN: 2, SUPERADMIN: 3}


def role_rank(user):
    if not user or not user.is_authenticated or not user.is_active:
        return 0
    if user.is_superuser:
        return RANK[SUPERADMIN]
    return RANK.get(getattr(user, 'role', ''), 0)


def has_min_role(user, role):
    return role_rank(user) >= RANK[role]


class MinRole(BasePermission):
    min_role = EDITOR

    def has_permission(self, request, view):
        return has_min_role(request.user, self.min_role)


class IsSuperAdmin(MinRole):
    min_role = SUPERADMIN


class IsAdminOrAbove(MinRole):
    min_role = ADMIN


class IsEditorOrAbove(MinRole):
    min_role = EDITOR


class RoleBasedWrite(BasePermission):
    """Public read; writes need a role. View declares:
       write_role   — min role for create/update (default ADMIN)
       delete_role  — min role for delete (default ADMIN)
       Non-safe actions listed in view.action_roles override per action name."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        action = getattr(view, 'action', None)
        overrides = getattr(view, 'action_roles', {})
        if action in overrides:
            needed = overrides[action]
        elif request.method == 'DELETE':
            needed = getattr(view, 'delete_role', ADMIN)
        else:
            needed = getattr(view, 'write_role', ADMIN)
        return has_min_role(request.user, needed)


def is_staff_user(user):
    return role_rank(user) >= RANK[EDITOR]
